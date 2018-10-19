//@ts-check

class ResponseBody{

    constructor(err, data, headers = null){
        this.error = this._stringifyError(err);
        this.payload = data;
        if (headers) {
            this.headers = headers;
        }        
    }

    _stringifyError(err){

        let ret = { message: "", stack: ""};

        if (!err) {
            ret = null;
        }
        else if (typeof err == "object") {
            if (err.message) {
                ret.message = err.message;
            }
            if (err.stack) {
                ret.stack = err.stack;
            }            
        }
        else {
            ret.message = err.toString();
        }

        return ret;
    }
}

module.exports = ResponseBody;