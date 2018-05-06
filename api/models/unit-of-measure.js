// @ts-check

/*
class *UnitOfMeasure*
    Abbrev:
        type: String
        req: true
        unique: true
        desc: Acronym or short name, like: "l" for litres, "cm3" for cubic centimeters, teaspoon, etc.
    Name:
        type: String
        req: true
        desc: like: "Litres", "Cubic centimeters", etc.
end class 
*/

var mongoose = require("mongoose");

module.exports = mongoose.model("UnitOfMeasure",
    new mongoose.Schema({
        abbrev: { type: String, required: true, unique: true },
        name: { type: String, required: true },
        createdOn: { type: Date, required: true},
        createdBy: { type: String, required: true},
        lastUpdateOn: { type: Date, required: false},
        lastUpdateBy: { type: String, required: false}
    }));
