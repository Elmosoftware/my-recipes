// @ts-check

/*
class *Ingredient*
    Name: 
        type: String
        desc: Name of the ingredient
        req: true
        unique: true
    CompatibleUnits:
        type: UnitOfMeasure[]
        req: true, at least one Unit must be added.
end class
*/

var mongoose = require("mongoose");

module.exports = mongoose.model("Ingredient",
    new mongoose.Schema({
        name: { type: String, required: true, unique: true },
        compatibleUnits: [{ type: mongoose.Schema.Types.ObjectId, ref: "UnitOfMeasure" }]
    }));