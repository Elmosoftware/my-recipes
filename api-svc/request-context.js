// @ts-check
var HttpStatus = require("http-status-codes");
var entities = require("./entities");
const ResponseBody = require("./response-body");

const allowedHTTPMethods = {
    GET: { errorCode: HttpStatus.INTERNAL_SERVER_ERROR, successCode: HttpStatus.OK },
    POST: { errorCode: HttpStatus.INTERNAL_SERVER_ERROR, successCode: HttpStatus.CREATED },
    PUT: { errorCode: HttpStatus.UNPROCESSABLE_ENTITY, successCode: HttpStatus.OK },
    DELETE: { errorCode: HttpStatus.UNPROCESSABLE_ENTITY, successCode: HttpStatus.OK },
}

/**
 * @class This class acts as a context for each individual request providing:
 * - Request validations.
 * - Simplifies access to request, URL, parameters, (both URL & query), user data, etc.
 * - Provides methods to work with the response.  
 */
class RequestContext {
   
    constructor(req, res, options) {
        this._method = "";
        this._entity = null;
        this._params = new Array();
        this._query = { top: "", skip: "", sort: "", pop: "", filter: "", count: "", fields: "" };
        this._hasQueryParameters = false;
        this._url = "";
        this._user = { rawData: null, id: "", isAdmin: false };
        this._options = options;
        this._res = res;
        this._isValidRequest = true;
        this._responseHeadersInPayload = null;

        this._initialize(req);
    }

    /**
     * Indicates if the request is valid. If this attribute hold the value "false", means that the response was already sent
     * with the error details and no need to proceed with "next()" middleware.
     */
    get isValidRequest() {
        return this._isValidRequest;
    }

    /**
     * Returns the request HTTP method.
     */
    get method() {
        return this._method;
    }

    /**
     * Returns a boolean value indicating if the current HTTP method is allowed by the API.
     */
    get isMethodAllowed() {

        var ret = false;
        //Method OPTION is used by the Browser to get the initial site requirements in terms of security and others. 
        //We don't use it directly in our API, but we need to support it.
        if (this._method == "OPTIONS" || allowedHTTPMethods[this._method]) {
            ret = true;
        }

        return ret;
    }

    /**
     * Returns the entity model.
     */
    get model() {

        if (this._entity) {
            return this._entity.model;
        }
        else {
            return null;
        }
    }

    /**
     * Returns the entity name.
     */
    get entity() {
        return this._entity;
    }

    /**
     * Returns the populate options set for the entity, (if any).
     */
    get modelPopulateOpts() {
        if (this._entity) {
            return this._entity.references.join(" ").toString();
        }
        else {
            return "";
        }
    }

    /**
     * Returns the request parameters set in the URL.
     */
    get params() {
        return this._params;
    }

    /**
     * Returns aboolean value indicating if the current filter in the URL query parameters is actually a text search.
     */
    get filterIsTextSearch() {
        return (this._query.filter.indexOf(`"$text":`) != -1);
    }

    /**
     * Returns the URL query parameters.
     */
    get query() {
        return this._query;
    }

    /**
     * Returns a boolean value indicating if  the URL has any query parameters.
     */
    get hasQueryParameters() {
        return this._hasQueryParameters;
    }

    /**
     * Request URL.
     */
    get url() {
        return this._url;
    }

    /**
     * Returns the profile of the authenticated user. If there is no authenticated user, this attribute will be null.
     */
    get user() {
        return this._user;
    }

    /**
     * Returns a boolean value indicating if this request is made by an authenticated user.
     */
    get isAuthenticated() {
        return !(this._user == null);
    }

    /**
     * Return an array with the allowed HTTP methods.
     */
    getAllowedHTTPMethods() {
        var m = Object.getOwnPropertyNames(allowedHTTPMethods);
        m.push("OPTIONS");
        return m;
    }

    /**
     * This return the appropiate HTTP status code based on the actual HTTP method and is the request generates an error or not.
     * @param {any|Error} err Request processing error or null.
     */
    getStatusCode(err) {

        var ret = HttpStatus.METHOD_NOT_ALLOWED;

        if (this.isMethodAllowed) {
            ret = (err) ? allowedHTTPMethods[this._method].errorCode : allowedHTTPMethods[this._method].successCode;
        }

        return ret;
    }

    /**
     * Allows to add a HTTP header to the response. Also we can indicate to include that header in the response body to facilitate 
     * getting the value on client side.
     * If 
     * @param {string} name HTTP Header name
     * @param {string} value HTTP Header value
     * @param {boolean} addToHeadersInPayload Indicates if this header must be included also in the "headers" attribute in the response body.
     */
    addResponseHeader(name, value, addToHeadersInPayload = false) {

        this._res.setHeader(name, value);

        if (addToHeadersInPayload) {

            if (!this._responseHeadersInPayload) {
                this._responseHeadersInPayload = new Object();
            }

            //Drop any dashes in the header name:
            name = name.replace(/-/g, "");
            this._responseHeadersInPayload[name] = value;
        }
    }

    /**
     * Send the HTTP response.
     * @param {any} err Error details
     * @param {any} data Payload
     * @param {number|string} statusCode Optional HTTP Status code to return. If is not specified, the API will return 
     * the appropiate code based on the HTTP Method and if the request was successful or not.
     */
    sendResponse(err, data, statusCode = null) {

        //If there is a valid Request delay configured and the RequestContextOptions are not preventing apply that delay, the
        //"applyDelay" flag will be true:
        let applyDelay = process.env.REQUESTS_ADDED_DELAY && !isNaN(Number(process.env.REQUESTS_ADDED_DELAY)) &&
            !(this._options && this._options.doNotApplyConfiguredDelay)

        if (!statusCode) {
            statusCode = this.getStatusCode(err);
        }

        if (applyDelay) {
            setTimeout(() => {
                this._res.status(statusCode).json(new ResponseBody(err, data, this._responseHeadersInPayload));
            }, Number(process.env.REQUESTS_ADDED_DELAY));
        }
        else {
            this._res.status(statusCode).json(new ResponseBody(err, data, this._responseHeadersInPayload));
        }
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

    _initialize(req) {

        let errors = new Array();

        this._setContext(req);

        if (!(this._options && this._options.disableCORSHeaders)) {
            //Setting CORS Headers:
            this._res.setHeader("Access-Control-Allow-Origin", "*");
            this._res.setHeader("Access-Control-Allow-Methods", this.getAllowedHTTPMethods().join(", "));
            this._res.setHeader("Access-Control-Allow-Headers", "Origin, Content-Type, X-Auth-Token, Authorization");
        }

        if (!(this._options && this._options.disableEntityCheck)) {
            //Check if the request is for a valid entity:
            if (!this.entity) {
                errors.push(`-The requested URI is invalid: "${encodeURI(this.url)}", no entity defined with that name.`)
            }
        }

        if (!(this._options && this._options.disableMethodCheck)) {
            //Check if the method is supported:
            if (!this.isMethodAllowed) {
                errors.push(`-The requested method is not supported by this API. Method: "${encodeURI(this.method)}". Allowed HTTP methods are: "${this.getAllowedHTTPMethods().join(", ")}".`)
            }
        }

        //If there was any error, we will response the error data:
        if (errors.length > 0) {
            let e = new Error(`Request was aborted. Please check error details below: \n"${errors.join("\n")}"`);
            this._isValidRequest = false;
            this.sendResponse(e, {}, HttpStatus.BAD_REQUEST);
        }
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

        this._params = parsedURL.params;

        //Parsing querystring parameters:
        Object.getOwnPropertyNames(this._query).forEach((element) => {
            this._query[element] = (req.query[element]) ? req.query[element] : "";
            this._hasQueryParameters = Boolean(this._hasQueryParameters || req.query[element]);
        });

        //If there is an authenticated user, we parse the user data:
        if (req.user) {
            this._user.rawData = req.user;
            this._user.id = req.user.sub;

            if (req.user[process.env.AUTHMANAGEMENT_METADATA_KEY] && req.user[process.env.AUTHMANAGEMENT_METADATA_KEY].role) {
                this._user.isAdmin = (req.user[process.env.AUTHMANAGEMENT_METADATA_KEY].role.toLowerCase() == "admin");
            }
        }
        else {
            this._user = null;
        }
    }
}

/**
 * @class This class holds the configuration for the RequestContext instance.
 */
class RequestContextOptions {

    /**
     * This are the options available for the RequestConext class.
     * @param {boolean} disableCORSHeaders Indicates if CORS headers will be sent in the response.
     * @param {boolean} disableEntityCheck Force not check for entity names in the URL.
     * @param {boolean} disableMethodCheck Indicates to not check if the HTTP method is allowed.
     * @param {boolean} doNotApplyConfiguredDelay This allows to overwrite any configured delay in .env file.
     */
    constructor(disableCORSHeaders = false,
        disableEntityCheck = false,
        disableMethodCheck = false,
        doNotApplyConfiguredDelay = false) {

        this.disableCORSHeaders = disableCORSHeaders;
        this.disableEntityCheck = disableEntityCheck;
        this.disableMethodCheck = disableMethodCheck;
        this.doNotApplyConfiguredDelay = doNotApplyConfiguredDelay;
    }
}

module.exports = { RequestContext, RequestContextOptions };