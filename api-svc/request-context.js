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
        this._query = { top: "", skip: "", sort: "", pop: "", filter: "" };
        this._hasQueryParameters = false;
        this._url = "";
        this._setContext(req);
    }

    get method() { 
        return this._method; 
    }

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

    get entity() { 
        return this._entity; 
    }

    get modelPopulateOpts() {
        if (this._entity) {
            return this._entity.references.join(" ").toString();
        }
        else {
            return "";
        }
    }

    get params() { 
        return this._params; 
    }

    get filterIsTextSearch() { 
        return (this._query.filter.indexOf(`"$text":`) != -1);
    }

    get query() { 
        return this._query; 
    }

    get hasQueryParameters() { 
        return this._hasQueryParameters; 
    }

    get url() { 
        return this._url; 
    }

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

    _parseURL(url) {

        let pos = 0;
        let ret = {
            entity: "",
            params: []
        }
        /*
            Possible URLs:
            /model/
            /model/ID
            /model/?{query parameters}
            /model/ID?{query parameters}

            Sample URLs:  
            '/recipes/?pop=false&filter={"$text":{"$search":"//"receta//""}}'
            '/recipes/5a1b55d8ee211d57141ec4fb/?pop=false'
        */

        //Parsing the Entity name:
        //=============================
        url = url.slice(url.startsWith("/") ? 1 : 0);//If the URL starts with a URL separator (/), we will remove it.
        pos = url.indexOf("/") //We search for the next separator so we can extract the entity name.

        //If there is no other separator all the URL is the entity, like in "/entity".
        if (pos == -1) {
            ret.entity = url;
            return ret;
        }

        ret.entity = url.slice(0, pos);
        url = url.slice(pos + 1); //Removing all until next caracter after the separator.

        //Parsing the Query:
        //==================
        pos = url.indexOf("?");

        if (pos != -1) {
            url = url.slice(0, pos); //If there is a query part, we ripped off.
        }

        if (url.endsWith("/")) { //if the URL still have a separator before the query symbol like in /myentity/?myquery=xxx
            url = url.slice(0, -1) // we ripped off too.
        }

        //Parsing other params:
        //==============================
        if (url) {
            ret.params = url.split("/"); 
        }
        
        return ret;
    }

    _setContext(req) {

        let parsedURL = {};

        this._url = decodeURI(req.url.toString());
        this._method = req.method;        
        parsedURL = this._parseURL(this._url);

        if (parsedURL.entity) {
            if (entities.exists(parsedURL.entity)) {
                this._entity = entities.getEntity(parsedURL.entity);
            }
        }

        // if (parsedURL.IDOrFilter) {
        //     this._params.push(parsedURL.IDOrFilter);
        //     // this._paramIsFilter = parsedURL.IDOrFilter.startsWith("{");

        //     // if (this._paramIsFilter) {
        //     //     this._paramIsTextSearch = (parsedURL.IDOrFilter.indexOf(`"$text":`) != -1) ? true : false;
        //     // }
        // }

        this._params = parsedURL.params;

        Object.getOwnPropertyNames(this._query).forEach((element) => {
            this._query[element] = (req.query[element]) ? req.query[element] : "";
            this._hasQueryParameters = Boolean(this._hasQueryParameters || req.query[element]);
        });
    }
}

module.exports = RequestContext;