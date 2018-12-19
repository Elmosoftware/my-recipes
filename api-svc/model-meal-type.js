// @ts-check

var mongoose = require("mongoose");
var helper = require("./entity-helper");

let schema = new mongoose.Schema(helper.addCommonEntityAttributes({
    /**
     * Meal name, (like Appetizer, Breakfast, etc.)
     */
    name: { type: String, required: true },
    /**
     * Meal description.
     */
    description: { type: String, required: true }
}));

schema.methods.toJSON = function () {
    return helper.preProcessJSON(this);
}

schema.index({ name: 1, deletedOn: 1 }, { unique: true, background: true, name: "EntityConstraint" })

module.exports = mongoose.model("MealType", schema, "mealtypes");