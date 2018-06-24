// @ts-check

var express = require("express");
var router = express.Router();
var HttpStatus = require("http-status-codes");
var RequestContext = require("./request-context");
const ResponseBody = require("./response-body");
const Service = require("./service");

//Middleware function specific to this route:
router.use(function (req, res, next) {
    //Do anything required here like logging, etc...

    req["context"] = new RequestContext(req);

    //Setting CORS Headers:
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", req["context"].getAllowedHTTPMethods().join(", "));
    res.setHeader("Access-Control-Allow-Headers", "Origin, Content-Type, X-Auth-Token");

    //Check if the request is for a valid entity:
    if (!req["context"].entity) {
        handleResponse(res, new Error(`The requested URI is invalid: "${encodeURI(req["context"].url)}"`),
            {}, HttpStatus.BAD_REQUEST);
        return;
    }

    //Check if the method is supported:
    if (!req["context"].isMethodAllowed) {
        handleResponse(res, new Error(`The requested method is not supported by this API. Method: "${encodeURI(req["context"].method)}"`),
            {}, req["context"].getStatusCode(null));
        return;
    }

    if (process.env.REQUESTS_ADDED_DELAY && !isNaN(Number(process.env.REQUESTS_ADDED_DELAY))) {
        setTimeout(() => {
            next();
        }, Number(process.env.REQUESTS_ADDED_DELAY));
    }
    else{
        next();
    }
});

router.get("/*", function (req, res) {

    var filterCond = "";
    const svc = new Service(req["context"].entity);

    /*
        This parameter can represent two things:

        1st- An object ID:
        ==================
        GET /api/myentity/5a319f76f45778387c6835f7 -> This will retrieve one single document searching by ID.

        2nd- A filter condition:
        ========================
        GET /api/myentity/{ "name": { "$in": [ "U7", "U8" ] } } -> This will retrieve all the documents that fullfill the condition.

        So far, just the first parameter is processed, if there is others, those will be ignored.
    */
    if (req["context"].params.length > 0) {
        filterCond = req["context"].params[0];
    }

    svc.find(filterCond, req["context"].query, (err, data) => {
        handleResponse(res, err, data, req["context"].getStatusCode(err));
    });
});

router.post("/*", function (req, res) {

    const svc = new Service(req["context"].entity);

    svc.add(req.body, (err, data) => {
        handleResponse(res, err, data, req["context"].getStatusCode(err));
    });
});

router.put("/*", function (req, res) {

    const svc = new Service(req["context"].entity);

    if (req["context"].params.length > 0) {
        svc.update(req["context"].params[0], req.body, (err, data) => {
            handleResponse(res, err, data, req["context"].getStatusCode(err));
        });
    }
    else {
        handleResponse(res, new Error(`You need to specify the "_id" of the target document to update. Massive updates are forbidden.
            Following context Details:
            Req URL: "${encodeURI(req["context"].url)}"`), {}, HttpStatus.BAD_REQUEST);
    }
});

router.delete("/*", function (req, res) {

    const svc = new Service(req["context"].entity);

    if (req["context"].params.length > 0) {
        svc.delete(req["context"].params[0], (err, data) => {
            handleResponse(res, err, data, req["context"].getStatusCode(err));
        });
    }
    else {
        handleResponse(res, new Error(`You need to specify the "_id" of the target document to delete. Massive deletions are forbidden.
        Following context Details:
        Req URL: "${encodeURI(req["context"].url)}"`), {}, HttpStatus.BAD_REQUEST);
    }
});

function handleResponse(res, err, data, statusCode) {
    res.status(statusCode).json(new ResponseBody(err, data));
}

module.exports = router;