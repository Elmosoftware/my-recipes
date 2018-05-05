// @ts-check
var mongoose = require("mongoose");
const ServiceValidator = require("./service-validator");
const Entities = require("./entities")

class Service {

    constructor(entity) {
        this._entity = entity;
    }

    getNewobjectId() {
        return mongoose.Types.ObjectId();
    }

    add(document, callback) {
        var val = new ServiceValidator();
        var promises = [];

        if (!val.validateCallback(callback).isValid) {
            return (callback(val.getErrors(), {}));
        }

        /*  IMPORTANT NOTE RELATED TO SUBDOCUMENTS AND THE WAY MONGO DB DEAL WITH THEM:
            ===========================================================================

            ISSUE DESCRIPTION:
            ------------------
            If we have the case of a document with child documents, (a.k.a: subdocs), and this subdocs are new ones; when 
            we persist the data we will get a cast exception.

            SOLUTION:
            ---------
            If we want to allow to create in the fly subdocuments as part of a parent document creation, we need to:

            1st - Save the subdocument/s.
            2nd - Change the document reference to the ObjectId reference of the subdoc created in 1st pass.
            3rd - Save the Parent document.

            Check the following online about this issue: 
            https://stackoverflow.com/questions/14758761/mongoose-create-reference-on-model-save?utm_medium=organic&utm_source=google_rich_qa&utm_campaign=google_rich_qa

            EXAMPLE:
            --------
            Let's supose we have the following schema defined with a One to Many relationship:

            mongoose.model("MyChild", new mongoose.Schema({
                childName: { type: String }
            }));
            mongoose.model("MyParent", new mongoose.Schema({
                parentName: { type: String }
                childCollection: [{ type: mongoose.Schema.Types.ObjectId, ref: "MyChild" }]
            }));

            If we try to save the following document:

            var MyParent = {
                parentName: "A normal parent referencing to already existing childs"
                childCollection: ["5adb3d054f78834a94a25f6a", "5aae9bf7d096af48709a21dd"]
            }
            
            This will normally not cause any issues, because the lack of referential integrity, Mongo will save the 
            document and assume the ObjectIds specified for the childs are valid ones. 
            But if we reference as childs, new documents like here:

            var MyParent = {
                parentName: "A parent referencing childs that do not exist yet!"
                childCollection: [{ childName: "Child #1"}, { childName: "Child #2"}]
            }

            This will cause a Casting exception. So we need to proceed as described in the solution. Let's see in detail using the 
            same sample case:

            1st - Save the subdocument/s.
                var myChildOne = { childName: "Child #1"}
                var myChildTwo = { childName: "Child #2"}

            2nd - Change the document reference to the ObjectId reference of the subdoc created in 1st pass.
                As part of the process of saving the childs, we get his new _ids. So now we replace the objects 
                by the ids in the parent and we persist the parent document a usual:
            var MyParent = {
                parentName: "A parent referencing childs that do not exist yet!"
                childCollection: ["{here the Child #1 ObjectId}", "{here the Child #2 ObjectId}"}]
            }
            3rd - Now we can save the parent object without issues.
        */

        if (!val.isValidObjectId(document._id)) {
            document._id = this.getNewobjectId();
        }

        //We look recursively to all the subdocuments and save them:
        promises = this.saveSubDocs(document, true)

        //This is to keep a reference to the model so we can persist the parent
        //document only if the subdocs where persisted successfully. 
        promises.push(Promise.resolve(this._entity.model)); //There is probably a better way to do this but i didn't find it :-(.

        Promise.all(promises)
            //If all Subdocs has been successfully persisted, we can proceed to try 
            //persisting the parent document:
            .then((results) => {
                try {
                    let model = results.pop(); //The last promise always holds a reference to the parent document model.
                    let obj = model.hydrate(document);
                    obj.isNew = true;
                    obj.save(callback);
                } catch (err) {
                    callback(err, {});
                }
            })
            //If there was any issues saving the subdocs, we will not save the parent doc:
            .catch((err) => {
                callback(err, {});
            });
    }

    update(id, document, callback) {
        var val = new ServiceValidator();
        var promises = [];        

        if (!val.validateCallback(callback).isValid) {
            return (callback(val.getErrors(), {}));
        }

        if (!val.isValidObjectId(document._id)) {
            document._id = id;
        }
        
        //Regarding subdocs, we proceed in the same way as in the add method:
        promises = this.saveSubDocs(document, true)
        promises.push(Promise.resolve(this._entity.model));

        Promise.all(promises)
            .then((results) => {
                try {
                    let model = results.pop();
                    
                    model.update({ _id: id }, document, (err, data) => {
                        //The attempt to update a non existent document by Id is not reported as error by Mongoose:
                        if (!err && data.n == 0) {
                            err = new Error("The last UPDATE operation affects no documents. Verify the document exists before to retry this operation.");
                        }
                        
                        return (callback(err, {}));
                    });
                } catch (err) {
                    callback(err, {});
                }
            })
            .catch((err) => {
                callback(err, {});
            });
    }

    find(conditions, query, callback) {
        var val = new ServiceValidator();
        var cursor = null;

        if (!val.validateCallback(callback)
            .validateConditions(conditions, false)
            .validateQuery(query)
            .isValid) {
            return (callback(val.getErrors(), {}));
        }

        cursor = this._entity.model.find(this._parseConditions(conditions))
            .skip(Number(query.skip));

        if (query.top) {
            cursor.limit(Number(query.top));
        }

        if (query.sort) {
            cursor.sort(query.sort);
        }

        if (query.pop != "false") {
            cursor.populate(this._entity.references.join(" ").toString())
        }

        // cursor.populate(this._entity.references.join(" ").toString())
        //     .exec(callback);
        cursor.exec(callback);
    }

    delete(conditions, callback) {
        var val = new ServiceValidator();

        if (!val.validateCallback(callback)
            .validateConditions(conditions, true)
            .isValid) {
            return (callback(val.getErrors(), {}));
        }

        this._entity.model.remove(this._parseConditions(conditions), (err, data) => {

            //The attempt to remove a non existent document by Id is not reported as error by Mongoose:
            if (!err && data.result.n == 0) {
                err = new Error("The last DELETE operation affects no documents. Verify the document exists before to retry this operation.");
            }

            data = {}; //Is not supposed that an update op returns any data.
            return (callback(err, data));
        });
    }

    saveSubDocs(doc, isParentDocument = false) {
        var val = new ServiceValidator();
        var promises = [];

        if (this._entity.references.length > 0) {
            this._entity.references.forEach((prop) => {

                //Check if the property exists:
                if (!doc[prop]) {
                    promises.push(Promise.reject(new Error(`Reference property "${prop}" is missing in ${this._entity.model.modelName}.`)))
                    return;
                }

                //If the property holds an array of child documents (One to many relationship):
                if (Array.isArray(doc[prop])) {
                    for (var i = 0; i < doc[prop].length; i++) {
                        //If the property is not an Object ID or a whole subdoc already persisted, means is a new one, so we 
                        //need to persist it first before to continue:
                        if (!val.isValidObjectId(doc[prop][i]) && !doc[prop][i]._id) {
                            //Save the  subdoc:
                            promises = promises.concat(this._saveSubDoc(doc, prop, i));
                            //Replacing the reference by the subdoc Id only:
                            doc[prop][i] = doc[prop][i]._id;
                        }
                    }
                }
                //If the property holds one single child document, (One to One relationship), we need 
                //to proceed in the same way:
                else if (!val.isValidObjectId(doc[prop]) && !doc[prop]._id) {
                    promises = promises.concat(this._saveSubDoc(doc, prop));
                    doc[prop] = doc[prop]._id;
                }
            });
        }

        if (!isParentDocument) {
            var obj = this._entity.model.hydrate(doc);
            obj.isNew = true;
            promises.push(obj.save());
        }

        return promises;
    }

    _saveSubDoc(parentDocument, propertyName, index) {

        let ref = this._getReferenceType(this._entity, propertyName);
        let refEntity = Entities.getEntityByModelName(ref);
        let refService = new Service(refEntity);
        let val = null;

        if(Number.isInteger(index)){
            val = parentDocument[propertyName][index];
        }
        else{
            val = parentDocument[propertyName];
        }
        
        //We assign the "_id" here because we need to persist the value in the parent document references without 
        //to wait to the async callback:
        val._id = this.getNewobjectId();

        //If the subdocument holds a reference to the parent document, we fill it with the parent Object id:
        if (refEntity.model.schema.obj.hasOwnProperty(this._entity.name)) {
            val[this._entity.name] = parentDocument._id;
        }

        return refService.saveSubDocs(val);
    }

    _getReferenceType(entity, propertyName) {

        let schemaEntry = entity.model.schema.obj[propertyName];
        let ret = "";

        if (Array.isArray(schemaEntry)) {
            ret = schemaEntry[0].ref;
        }
        else {
            ret = schemaEntry.ref;
        }

        return ret;
    }

    _parseConditions(conditions) {
        var val = new ServiceValidator();

        if (!conditions) {
            return {};
        } else if (val.isValidObjectId(conditions)) {
            return { _id: conditions };
        }
        else {
            return JSON.parse(decodeURIComponent(conditions));
        }
    }
}

module.exports = Service;
