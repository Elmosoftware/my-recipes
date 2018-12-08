// @ts-check

var mongoose = require("mongoose");
var helper = require("../entity-helper");

let schema = new mongoose.Schema(helper.addCommonEntityAttributes({
    /**
     * A reference to the Recipe to which this RecipeIngredient belongs.  
     */
    recipe: { type: mongoose.Schema.Types.ObjectId, ref: "Recipe" },
    /**
     * A reference to the ingredient.
     */
    ingredient: { type: mongoose.Schema.Types.ObjectId, ref: "Ingredient" },
    /**
     * Amount of the Ingredient to be used in the Recipe.
     */
    amount: { type: Number, required: true },
    /**
     * Unit of measure in which the Ingredient is expressed.
     */
    unit: { type: mongoose.Schema.Types.ObjectId, ref: "UnitOfMeasure" }
}));

schema.methods.toJSON = function () {
    return helper.preProcessJSON(this);
}

schema.index({ recipe: 1, ingredient: 1 }, { background: true, name: "RecipeIngredient_Recipe_Ingredient" })

module.exports = mongoose.model("RecipeIngredient", schema);