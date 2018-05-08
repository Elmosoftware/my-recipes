// @ts-check

/*
enum *MealType*
     Name:
        type: String
        desc: Name of the meal type.
        req: true
        unique: true
        note: Composed by the following:
            - Appetizer
            - Breakfast
            - MainDish
            - Dessert
    Description:
        type: String
        desc: Level Description.
end enum
*/

var mongoose = require("mongoose");

module.exports = mongoose.model("MealType",
    new mongoose.Schema({
        name: { type: String, required: true, unique: true },
        description: { type: String, required: true },
        createdOn: { type: Date, required: true},
        createdBy: { type: String, required: true},
        lastUpdateOn: { type: Date, required: false},
        lastUpdateBy: { type: String, required: false}
    }));
