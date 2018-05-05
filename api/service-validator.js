//@ts-check

const ValidatorBase = require("./validator-base");

class ServiceValidator extends ValidatorBase {

    constructor() {
        super();
    }

    validateCallback(callback) {
        var ret = "";

        if (typeof callback !== "function") {
            ret = `We expected a callback function in parameter "callback" and we get a type of '${(!callback) ? "null|undefined" : (typeof callback)}'.`;
        }

        if (ret) {
            super._addError(ret);
        }

        return this;
    }

    validateConditions(conditions, onlyAllowObjectId) {
        var ret = "";
        onlyAllowObjectId = (onlyAllowObjectId) ? true : false;

        if (!(typeof conditions === "string")) {
            ret = `We expected a String for parameter "conditions" and we get a type of '${typeof conditions}'.`;
        }
        else {

            var isJSONFilter = conditions.toString().startsWith("{");

            //If only Object Ids are allowed as parameters:
            if (onlyAllowObjectId && isJSONFilter) {
                ret = `We expected only Object Ids as parameters for this request. Filter parameters are forbidden for this particular action. Parameter received: '${conditions}'`
            }

            //If the parameter is not a JSON Filter and also is not empty, we check if it's a valid Object Id:
            if (!isJSONFilter && conditions && !this.isValidObjectId(conditions.toString())) {
                ret = `The Object Id '${conditions}' is not a valid object Id.`;
            }
        }

        if (ret) {
            super._addError(ret);
        }

        return this;
    }

    validateQuery(query) {
        var ret = "";

        if (!query) {
            ret = `The parameter "query" can't be null or empty. Parameter value: '${query}'.`;
        }
        if (!(query === Object(query))) {
            ret = `We expected an Object for parameter "query" and we get a type of '${typeof query}'.`;
        }
        else if (query.skip || query.top) {
            this._validatePagination(query.skip, query.top);
        }
        else if (query.sort) {
            this._validateSorting(query.sort);
        }
        else if (query.pop) {
            this._validatePopulateReferences(query.pop);
        }

        if (ret) {
            super._addError(ret);
        }

        return this;
    }

    isValidObjectId(id) {
        /*
            Created by Felipe Lorenzo VI 
            https://github.com/cnkdynamics/valid-objectid
        */

        // check first if undefined
        if (!id) {
            return false;
        }

        // check if id is a valid string
        if (typeof id !== 'string') {
            id = id.toString();
        }

        // simply match the id from regular expression
        if (id.match(/^[0-9a-fA-F]{24}$/)) {
            return true;
        } else {
            return false;
        }
    }

    _validatePagination(skip, top) {
        var ret = "";

        if (!((typeof skip === "string") || (typeof skip === "number"))) {
            ret = `We expected a String or Number for the pagination parameter "skip".
                Current type: "skip" is "${typeof skip}".`;
        }
        else if (!((typeof top === "string") || (typeof top === "number"))) {
            ret = `We expected a String or Number for the pagination parameter "top".
                Current type: "top" is "${typeof top}".`;
        }
        else if (Number.isNaN(Number(skip))) {
            ret = `The pagination parameter "skip" is not a number.
                Current value: "skip"=${skip}.`;
        }
        else if (Number.isNaN(Number(top))) {
            ret = `The pagination parameter "top" is not a number.
                Current value: "top"=${top}.`;
        }
        else if (skip != "" && Number(skip) < 0) {
            ret = `The pagination parameter "skip" can't be negative.
                Current value: "skip"=${skip}.`;
        }
        else if (top != "" && Number(top) <= 0) {
            ret = `The pagination parameter "top" can't be negative or zero.
                Current value: "top"=${top}.`;
        }

        if (ret) {
            super._addError(ret);
        }

        return this;
    }

    _validateSorting(sort, allowEmpty = true) {
        var ret = "";

        if (!(typeof sort === "string")) {
            ret = `We expected a String for the parameter "sort".
                Current type: "sort" is "${typeof sort}".`;
        }

        if (ret) {
            super._addError(ret);
        }

        return this;
    }

    _validatePopulateReferences(pop) {
        var ret = "";

        if (!(typeof pop === "string")) {
            ret = `We expected a String or Number for the "populate references" query parameter "pop".
                        Current type: "pop" is "${typeof pop}".`;
        }
        else if (!(pop == "" || pop == "true" || pop == "false")) {
            ret = `The "populate references" parameter "pop" can accept only the following values: "true", "false" or empty, (which by default will turn to "true").
                        Current value: "pop"=${pop}.`;
        }

        if (ret) {
            super._addError(ret);
        }

        return this;
    }
}

module.exports = ServiceValidator;
