// @ts-check

/**
 * Add to the supplied schema definition, all the attributes that are common to any entity.
 * This also support the following custom field attributes:
 *  - hidden {boolean}: Indicates if the field is for internal use only. If this attribute has the 
 * value "true", the field will be removed from the JSON delivered to the client.
 *  - notQueryable {boolean}: Indicates if the field can be used or not on query filter conditions. if this 
 * attribute has the value "true", any attempt to include this in a query filter condition will cause an exception. 
 * @param {*} schemaDefinition Entity schema definition.
 * @returns The supplied SchemaDefinition with the added common entity attributes.
 */
function addCommonEntityAttributes(schemaDefinition) {

   schemaDefinition.createdOn = { type: Date, required: true };
   schemaDefinition.createdBy = { type: String, required: true, notQueryable: true };
   schemaDefinition.lastUpdateOn = { type: Date, required: false };
   schemaDefinition.lastUpdateBy = { type: String, required: false, notQueryable: true };
   schemaDefinition.publishedOn = { type: Date, required: false, notQueryable: true };
   schemaDefinition.deletedOn = { type: Date, required: false , hidden: true, notQueryable: true };
   
   return schemaDefinition;
}

/**
 * This method preprocess the JSON that will be delivered to the client for the following purposes:
 *   - Remove attributes marked as "hidden" in the schema definition.
 * @param {*} model Entity model
 */
function preProcessJSON(model) {
    let obj = model.toObject();

    //If an entity property had the "hidden" attribute with value "true", that 
    //property need to be removed from the JSON:
    Object.getOwnPropertyNames(model.schema.obj).forEach((prop) => {
        if (model.schema.obj[prop].hidden) {
            delete obj[prop];
        }
    });

    return obj;
}

module.exports = { addCommonEntityAttributes, preProcessJSON };