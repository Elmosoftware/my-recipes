// @ts-check

const entities = {
    units: { name:"unit", model: require("./models/unit-of-measure"), references: [] },
    levels: { name:"level", model: require("./models/level"), references: [] },
    mealtypes: { name:"mealtype", model: require("./models/meal-type"), references: [] },
    ingredients: { name:"ingredient", model: require("./models/ingredient"), references: [] },
    recipes: { name:"recipe", model: require("./models/recipe"), references: [] },
    recipeingredients: { name:"recipeingredient", model: require("./models/recipe-ingredients"), references: [] }
};

class Entities {
    constructor() {
        this._items = entities;

        for (var key in this._items){
            this._items[key].references = this._getModelReferences(this._items[key].model);
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

        // Object.getOwnPropertyNames(this._items).forEach((name) => {           
        //     if (this._items[name].model.modelName == modelName) {
        //         ret = this._items[name];
        //     }
        // })

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
