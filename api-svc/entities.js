// @ts-check

const Security = require("./security-service");

const entities = {
    units: {
        name: "unit",
        model: require("./model-unit"),
        references: [],
        readNotPublishedPrivilege: Security.ACCESS_PRIVILEGES.ADMINISTRATORS,
        writePrivileges: Security.ACCESS_PRIVILEGES.ADMINISTRATORS,
        deletePrivileges: Security.ACCESS_PRIVILEGES.ADMINISTRATORS,
        hiddenFields: [],
        notQueryableFields: []
    },
    levels: { 
        name: "level", 
        model: require("./model-level"), 
        references: [],
        readNotPublishedPrivilege: Security.ACCESS_PRIVILEGES.ADMINISTRATORS,
        writePrivileges: Security.ACCESS_PRIVILEGES.ADMINISTRATORS,
        deletePrivileges: Security.ACCESS_PRIVILEGES.ADMINISTRATORS,
        hiddenFields: [],
        notQueryableFields: []
    },
    mealtypes: { 
        name: "mealtype", 
        model: require("./model-meal-type"), 
        references: [],
        readNotPublishedPrivilege: Security.ACCESS_PRIVILEGES.ADMINISTRATORS,
        writePrivileges: Security.ACCESS_PRIVILEGES.ADMINISTRATORS,
        deletePrivileges: Security.ACCESS_PRIVILEGES.ADMINISTRATORS,
        hiddenFields: [],
        notQueryableFields: []
    },
    ingredients: { 
        name: "ingredient", 
        model: require("./model-ingredient"), 
        references: [],
        readNotPublishedPrivilege: Security.ACCESS_PRIVILEGES.ADMINISTRATORS,
        writePrivileges: Security.ACCESS_PRIVILEGES.AUTHENTICATED,
        deletePrivileges: Security.ACCESS_PRIVILEGES.ADMINISTRATORS,
        hiddenFields: [],
        notQueryableFields: []
    },
    recipes: { 
        name: "recipe", 
        model: require("./model-recipe"), 
        references: [],
        readNotPublishedPrivilege: Security.ACCESS_PRIVILEGES.OWNER,
        writePrivileges: Security.ACCESS_PRIVILEGES.OWNER,
        deletePrivileges: Security.ACCESS_PRIVILEGES.OWNER,
        hiddenFields: [],
        notQueryableFields: []
    },
    recipeingredients: { 
        name: "recipeingredient", 
        model: require("./model-recipe-ingredients"), 
        references: [],
        readNotPublishedPrivilege: Security.ACCESS_PRIVILEGES.OWNER,
        writePrivileges: Security.ACCESS_PRIVILEGES.OWNER,
        deletePrivileges: Security.ACCESS_PRIVILEGES.OWNER,
        hiddenFields: [],
        notQueryableFields: []
    }
};

/**
 * Expose all the model entities used in the application including details like reference to other entities, 
 * security constraints, specific field attributes, etc.
 */
class Entities {
    constructor() {
        this._items = entities;

        for (var key in this._items){
            this._items[key].references = this._getModelReferences(this._items[key].model);
            this._items[key].hiddenFields = this._getHiddenFields(this._items[key].model);
            this._items[key].notQueryableFields = this._getNotQueryableFields(this._items[key].model);
        }
    }

    //#region Private Members

    /**
     * Populates the Entity references list.
     * @param {*} model Entity model object.
     */
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

    /**
     * Populates the Entity hidden fields list.
     * @param {*} model Entity model
     */
    _getHiddenFields(model){
        const ret = new Array();

        Object.getOwnPropertyNames(model.schema.obj).forEach((prop) => {
            if (model.schema.obj[prop].hidden) {
                ret.push(prop);
            }
        });

        return ret;
    }

    /**
     * Populates the Entity Not Queryable fields list.
     * @param {*} model Entity model
     */
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

    //#endregion

    /**
     * Returns a boolean value indicating if there is an Entity with the referenced name. 
     * @param {string} name Entity name to search for.
     */
    exists(name){
        return (this._items[name]) ? true : false;
    }

    /**
     * Return an object that include a reference to the Entity model a also other details like:
     *  - @property {string} name: The entity name.
     *  - @property {string[]} references: A list of other entities referenced by this one.
     *  - @property {string[]} hiddenFields: A list of hidden fields. 
     *      - **What this mean?**: This are fields that will be hidden from any output. They exist only 
     * for API internal use.  
     * Currently the case for this is the "*deletedOn*" field used to handle soft deletion implemented in this API.
     * This field should be accessed only by the API and can't be read or modified in any way for a client app.
     *  - @property {string[]} notQueryableFields: A list of fields that **must be banned** from any condition filter 
     * supplied by the client. Some example of this cases is the Audit specific fields like "*publishedOn*" or 
     * "*CreatedBy*".
     * If a client sends a request including any of this fields an error will be returned. This kind of filtering 
     * is provided by special querystring attributes in the request like "pub" or "owner".
     *  - Security access contraints attributes: There is also a set of security access attributes that prevent the 
     * access to a specific set of users. This attributes are:
     *      - @property {Security.ACCESS_PRIVILEGES} readNotPublishedPrivilege
     *      - @property {Security.ACCESS_PRIVILEGES} writePrivileges
     *      - @property {Security.ACCESS_PRIVILEGES} deletePrivileges
     *    
     * @param {string} name Entity name.
     */
    getEntity(name) {
        if (this.exists(name)) {
            return this._items[name];
        }
        else {
            throw new Error(`There is no model defined with name "${name}".`);
        }
    }

    /**
     * Returns the entity details object for his model name. 
     * @param {string} modelName 
     */
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
