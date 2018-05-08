// @ts-check

/*
class *Recipe*
    Name: 
        type: String
        desc: Name of the recipe
        req: true
        unique: true
    Description: 
        type: String
        desc: A no more than 2 lines dish description like "An easy to cook version of the marinade sausage that our kids will love".
    EstimatedTime: 
        type: Number
        desc: Total preparation time Stored in minutes. 
    Level:
        type: Level
        desc: Represent the skill level required for this preparation.
    MealType:
        type: MealType
        desc: The type of meal this recipe is.
    Ingredients: 
        type: RecipeIngredient[]
        desc: List of ingredientes and amount of each one as other details.
    Directions:
        type: String[]
        desc: The set of directions required to prepare the recipe.
end class
*/

var mongoose = require("mongoose");

module.exports = mongoose.model("Recipe",
    new mongoose.Schema({
        name: { type: String, required: true, unique: true },
        description: { type: String },
        estimatedTime: { type: Number },
        level: { type: mongoose.Schema.Types.ObjectId, ref: "Level", required: true },
        mealType: { type: mongoose.Schema.Types.ObjectId, ref: "MealType", required: true },
        ingredients: [{ type: mongoose.Schema.Types.ObjectId, ref: "RecipeIngredient", required: true }],
        directions: [{type: String, required: true}],
        createdOn: { type: Date, required: true},
        createdBy: { type: String, required: true},
        lastUpdateOn: { type: Date, required: false},
        lastUpdateBy: { type: String, required: false}
    }));