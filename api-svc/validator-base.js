// @ts-check

class ValidatorBase {

    constructor() {
        this._results = [];
    }

    _addError(errorMsg) {
        this._results.push("-" + errorMsg)
    }

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