// @ts-check

var mongoose = require("mongoose");
var helper = require("./entity-helper");

let schema = new mongoose.Schema(helper.addCommonEntityAttributes({
   /**
    * Ingredient name
    */
    name: { type: String, required: true },
    /**
     * List of compatible units of measure for this ingredient.
     */
    compatibleUnits: [{ type: mongoose.Schema.Types.ObjectId, ref: "Unit" }]
}));

schema.methods.toJSON = function () {
    return helper.preProcessJSON(this);
}

schema.index({ name: 1, deletedOn: 1 }, { unique: true, background: true, name: "EntityConstraint" })

module.exports = mongoose.model("Ingredient", schema, "ingredients");