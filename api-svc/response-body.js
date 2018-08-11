//@ts-check

class ResponseBody{

    constructor(err, data, headers = null){
        this.error = err;
        this.payload = data;
        if (headers) {
            this.headers = headers;
        }        
    }
}

module.exports = ResponseBody;