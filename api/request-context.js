// @ts-check
var HttpStatus = require("http-status-codes");
var entities = require("./entities");
const allowedHTTPMethods = {
        GET: { errorCode: HttpStatus.INTERNAL_SERVER_ERROR, successCode: HttpStatus.OK },
        POST: { errorCode: HttpStatus.INTERNAL_SERVER_ERROR, successCode: HttpStatus.CREATED },
        PUT: { errorCode: HttpStatus.UNPROCESSABLE_ENTITY, successCode: HttpStatus.OK },
        DELETE: { errorCode: HttpStatus.UNPROCESSABLE_ENTITY, successCode: HttpStatus.OK },
    }

class RequestContext {
    constructor(req) {
        this._method = "";
        this._entity = null;
        this._params = new Array();
        this._paramIsFilter = false;
        this._query = { top: "", skip: "", sort: "", pop:""};
        this._hasQueryParameters = false;
        this._url = "";
        this._setContext(req);
    }

    get method() { return this._method; }

    get isMethodAllowed() {

        var ret = false;
        //Method OPTION is used by the Browser to get the initial site requirements in terms of security and others. 
        //We don't use it directly in our API, but we need to support it.
        if (this._method == "OPTIONS" || allowedHTTPMethods[this._method]) {
            ret = true;
        }
    
        return ret;
    }

    get model() {

        if (this._entity) {
            return this._entity.model;
        }
        else {
            return null;
        }
    }

    get entity() { return this._entity; }

    get modelPopulateOpts() {
        if (this._entity) {
            return this._entity.references.join(" ").toString();
        }
        else {
            return "";
        }        
    }

    get params() { return this._params; }
    
    get paramIsFilter() { return this._paramIsFilter; }
    
    get query() { return this._query; }

    get hasQueryParameters() { return this._hasQueryParameters; }

    get url() { return this._url; }

    getAllowedHTTPMethods() {
        var m = Object.getOwnPropertyNames(allowedHTTPMethods);
        m.push("OPTIONS");
        return m;
    }

    getStatusCode(err) {
        
        var ret = HttpStatus.METHOD_NOT_ALLOWED;
    
        if (this.isMethodAllowed) {
            ret = (err) ? allowedHTTPMethods[this._method].errorCode : allowedHTTPMethods[this._method].successCode;    
        }
    
        return ret;
    }

    _setContext(req) {
        /*
            Possible URLs:
            /model/
            /model/{ID or JSON filter}
            /model/?{query parameters}
            /model/{ID or JSON filter}?{query parameters}
        */
        this._url = decodeURI(req.url.toString());
        var path = this._url.slice(1).split("/");        
        this._method = req.method;

        if (path[0] != "") {
            if (entities.exists(path[0])) {
                this._entity = entities.getEntity(path[0]);
            }
        }

        //Check for request parameters:
        if (path.length > 1) {
            for (var i = 1; i < path.length; i++) {

                //Excluding query strings, (if any):
                let pos = path[i].indexOf("?");

                if (pos > -1) {
                    path[i] = path[i].substr(0, pos)
                }                

                if (path[i]) {
                    this._paramIsFilter = (path[i].startsWith("{"));
                    this._params.push(path[i]);
                }
            }
        }

        //Parsing query parameters:
        Object.getOwnPropertyNames(this._query).forEach((element) => {
            this._query[element] = (req.query[element]) ? req.query[element] : "";
            this._hasQueryParameters = Boolean(this._hasQueryParameters || req.query[element]);
        });
    }
}

module.exports = RequestContext;