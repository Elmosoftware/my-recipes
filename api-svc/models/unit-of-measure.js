// @ts-check

var mongoose = require("mongoose");
var helper = require("../entity-helper");

let schema = new mongoose.Schema(helper.addCommonEntityAttributes({
    /**
     * Unit abbreviation, acronym or short name, like: "l" for litres, "cm3" for cubic centimeters, teaspoon, etc.
     */
    abbrev: { type: String, required: true },
    /**
     * Unit full name, (like Kilogram, Cubic centimeters, Litres, etc.)
     */
    name: { type: String, required: true }
}));

schema.methods.toJSON = function () {
    return helper.preProcessJSON(this);
}

schema.index({ abbrev: 1, deletedOn: 1 }, { unique: true, background: true, name: "EntityConstraint" })

module.exports = mongoose.model("UnitOfMeasure", schema);