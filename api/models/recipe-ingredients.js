// @ts-check

/*
class *RecipeIngredient*
    Recipe:
        type: Recipe
        desc: The recipe in which this ingredient take part.
        req: true
    Ingredient:
        type: Ingredient
        req: true
        unique: true for this recipe.
    Amount:
        type: Number
        req: true
    Unit:
        type: UnitOfMeasure
        req: true
end class
*/

var mongoose = require("mongoose");

module.exports = mongoose.model("RecipeIngredient",
    new mongoose.Schema({
        recipe: { type: mongoose.Schema.Types.ObjectId, ref: "Recipe" },
        ingredient: { type: mongoose.Schema.Types.ObjectId, ref: "Ingredient" },
        amount: { type: Number, required: true},
        unit: { type: mongoose.Schema.Types.ObjectId, ref: "UnitOfMeasure" },
        createdOn: { type: Date, required: true},
        createdBy: { type: String, required: true},
        lastUpdateOn: { type: Date, required: false},
        lastUpdateBy: { type: String, required: false}
    }));