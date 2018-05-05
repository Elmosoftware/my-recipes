//@ts-check

class ResponseBody{

    constructor(err, data){
        this.error = this._stringify(err);
        this.payload = this._stringify(data);
    }

    _stringify(value) {
        var ret = JSON.stringify((value) ? value : null); //To avoid "undefined".
        var nulls = ["null", "{}"];

        /*
            There is some cases, (like an standard Error object), where the 
            JSON stringification process doesn't work at least you passed the list of attributes to include.
        */
        if (value && (value === Object(value)) && nulls.indexOf(ret) != -1) {
            ret = JSON.stringify(value, Object.getOwnPropertyNames(value).sort());
        }

        return ret;
    }
}

module.exports = ResponseBody;