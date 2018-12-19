// @ts-check

/**
 * Provides basic methods to apply basic validation rules.
 * Provide an internal repository of validation error messages and also an attribute indicating 
 * if the validation was successful or not.
 */
class ValidatorBase {

    constructor() {
        this._results = [];
    }

    //#region Private Members
    _addError(errorMsg) {
        this._results.push("-" + errorMsg)
    }
    //#endregion

    get isValid() {
        return (this._results.length == 0);
    }

    getErrors() {
        var ret = null;

        if (!this.isValid) {
            ret = new Error(this._results.join("\n"));
        }

        return ret;
    }
}

module.exports = ValidatorBase;