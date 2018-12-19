// @ts-check

var mongoose = require("mongoose");
var helper = require("./entity-helper");

let schema = new mongoose.Schema(helper.addCommonEntityAttributes({
    /**
     * Recipe name.
     */
    name: { type: String, required: true },
    /**
     * Recipe description. A no more than 2 lines dish description like "An easy to cook version of the 
     * marinade sausage that our kids will love".
     */
    description: { type: String },
    /**
     * Total preparation time Stored in minutes.
     */
    estimatedTime: { type: Number },
    /**
     * Skill level required for this preparation.
     */
    level: { type: mongoose.Schema.Types.ObjectId, ref: "Level", required: true },
    /**
     * The type of meal this recipe is intended for, (like a main dish, appetizer, etc.)
     */
    mealType: { type: mongoose.Schema.Types.ObjectId, ref: "MealType", required: true },
    /**
     * List of ingredients, amounts, and other details.
     */
    ingredients: [{ type: mongoose.Schema.Types.ObjectId, ref: "RecipeIngredient", required: true }],
    /**
     * The complete set of directions required to prepare the recipe.
     */
    directions: [{ type: String, required: true }]
}));

schema.methods.toJSON = function () {
    return helper.preProcessJSON(this);
}

schema.index({ name: 1, deletedOn: 1 }, { unique: true, background: true, name: "EntityConstraint" })
schema.index(
    {
        name: "text",
        description: "text",
        directions: "text"
    },
    {
        name: "RecipeFullTextSearchIndex",
        default_language: "spanish",
        weights: {
            name: 3,
            description: 2,
            directions: 1
          },
    });

module.exports = mongoose.model("Recipe", schema, "recipes");