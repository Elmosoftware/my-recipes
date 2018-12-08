// @ts-check

const Security = require("./security-service");

const entities = {
    units: {
        name: "unit",
        model: require("./models/unit-of-measure"),
        references: [],
        readNotPublishedPrivilege: Security.ACCESS_PRIVILEGES.ADMINISTRATORS,
        writePrivileges: Security.ACCESS_PRIVILEGES.ADMINISTRATORS,
        deletePrivileges: Security.ACCESS_PRIVILEGES.ADMINISTRATORS,
        hiddenFields: [],
        notQueryableFields: []
    },
    levels: { 
        name: "level", 
        model: require("./models/level"), 
        references: [],
        readNotPublishedPrivilege: Security.ACCESS_PRIVILEGES.ADMINISTRATORS,
        writePrivileges: Security.ACCESS_PRIVILEGES.ADMINISTRATORS,
        deletePrivileges: Security.ACCESS_PRIVILEGES.ADMINISTRATORS,
        hiddenFields: [],
        notQueryableFields: []
    },
    mealtypes: { 
        name: "mealtype", 
        model: require("./models/meal-type"), 
        references: [],
        readNotPublishedPrivilege: Security.ACCESS_PRIVILEGES.ADMINISTRATORS,
        writePrivileges: Security.ACCESS_PRIVILEGES.ADMINISTRATORS,
        deletePrivileges: Security.ACCESS_PRIVILEGES.ADMINISTRATORS,
        hiddenFields: [],
        notQueryableFields: []
    },
    ingredients: { 
        name: "ingredient", 
        model: require("./models/ingredient"), 
        references: [],
        readNotPublishedPrivilege: Security.ACCESS_PRIVILEGES.ADMINISTRATORS,
        writePrivileges: Security.ACCESS_PRIVILEGES.AUTHENTICATED,
        deletePrivileges: Security.ACCESS_PRIVILEGES.ADMINISTRATORS,
        hiddenFields: [],
        notQueryableFields: []
    },
    recipes: { 
        name: "recipe", 
        model: require("./models/recipe"), 
        references: [],
        readNotPublishedPrivilege: Security.ACCESS_PRIVILEGES.OWNER,
        writePrivileges: Security.ACCESS_PRIVILEGES.OWNER,
        deletePrivileges: Security.ACCESS_PRIVILEGES.OWNER,
        hiddenFields: [],
        notQueryableFields: []
    },
    recipeingredients: { 
        name: "recipeingredient", 
        model: require("./models/recipe-ingredients"), 
        references: [],
        readNotPublishedPrivilege: Security.ACCESS_PRIVILEGES.OWNER,
        writePrivileges: Security.ACCESS_PRIVILEGES.OWNER,
        deletePrivileges: Security.ACCESS_PRIVILEGES.OWNER,
        hiddenFields: [],
        notQueryableFields: []
    }
};

class Entities {
    constructor() {
        this._items = entities;

        for (var key in this._items){
            this._items[key].references = this._getModelReferences(this._items[key].model);
            this._items[key].hiddenFields = this._getHiddenFields(this._items[key].model);
            this._items[key].notQueryableFields = this._getNotQueryableFields(this._items[key].model);
        }
    }

    _getModelReferences(model){
        const schemaTree = model.schema.tree;
        const ret = new Array();

        for (var key in schemaTree){
            if (this._isRef(schemaTree[key])) {
                ret.push(key);
            }
        }

        return ret;
    }

    _getHiddenFields(model){
        const ret = new Array();

        Object.getOwnPropertyNames(model.schema.obj).forEach((prop) => {
            if (model.schema.obj[prop].hidden) {
                ret.push(prop);
            }
        });

        return ret;
    }

    _getNotQueryableFields(model){
        const ret = new Array();

        Object.getOwnPropertyNames(model.schema.obj).forEach((prop) => {
            if (model.schema.obj[prop].notQueryable) {
                ret.push(prop);
            }
        });

        return ret;
    }

    _isRef(schemaProperty){
        if (Array.isArray(schemaProperty)) {
            if (schemaProperty.length > 0) {
                return (schemaProperty[0].ref) ? true : false;
            }
            else{
                return false;
            }
        }
        else{
            return (schemaProperty.ref) ? true : false;
        }
    }

    exists(name){
        return (this._items[name]) ? true : false;
    }

    getEntity(name) {
        if (this.exists(name)) {
            return this._items[name];
        }
        else {
            throw new Error(`There is no model defined with name "${name}".`);
        }
    }

    getEntityByModelName(modelName){

        let ret = null;

        for (let name of Object.getOwnPropertyNames(this._items)) {
            if (this._items[name].model.modelName == modelName) {
                ret = this._items[name];
                break;
            }
        }

        if (!ret) {
            throw new Error(`There is no model defined by the model name "${modelName}".`);
        }

        return ret;
    }
}

module.exports = new Entities();
