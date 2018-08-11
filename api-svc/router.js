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
            {}, null, HttpStatus.BAD_REQUEST);
        return;
    }

    //Check if the method is supported:
    if (!req["context"].isMethodAllowed) {
        handleResponse(res, new Error(`The requested method is not supported by this API. Method: "${encodeURI(req["context"].method)}"`),
            {}, null, req["context"].getStatusCode(null));
        return;
    }

    if (process.env.REQUESTS_ADDED_DELAY && !isNaN(Number(process.env.REQUESTS_ADDED_DELAY))) {
        setTimeout(() => {
            next();
        }, Number(process.env.REQUESTS_ADDED_DELAY));
    }
    else {
        next();
    }
});

router.get("/*", function (req, res) {

    const svc = new Service(req["context"].entity);
    var condition = ""; //This is the search condition. Could be an Object Id or a JSON filter.
    var projection = null;
    var promises = [];
    var isCounting = (req["context"].query.count.toLowerCase() == "true")

    /*
        The first element in the "params" collections is an Object ID, (e.g: "5a319f76f45778387c6835f7"), a 
        document unique identifier.
        NOTE: So far, just the first parameter is processed, if there is others, those will be ignored.
    */
    if (req["context"].params.length > 0) {
        condition = req["context"].params[0];
    }
    else if (req["context"].query.filter) { //If the condition is not an Object ID, we look at the filter querystring parameter:

        condition = req["context"].query.filter

        //If the filter condition is a FULL test search condition:
        if (req["context"].filterIsTextSearch) {
            //We add the projections and sort conditions so we can return the results sorted by relevance:
            projection = { score: { $meta: "textScore" } };

            if (!req["context"].query.sort) {
                req["context"].query.sort = { score: { $meta: "textScore" } };
            }
        }
    }

    //If we are counting records:
    if (isCounting) {
        promises.push(svc.count(condition));
    }

    promises.push(svc.find(condition, projection, req["context"].query));

    Promise.all(promises)
        .then((results) => {
            try {
                let headers = null;

                if (isCounting) {
                    res.setHeader("X-Total-Count", results[0]);
                    headers = { XTotalCount : results[0] };
                }
                
                handleResponse(res, null, results[results.length-1], headers, req["context"].getStatusCode(null));

            } catch (err) {
                handleResponse(res, err, {}, null, req["context"].getStatusCode(null));
            }
        })
        .catch((err) => {
            handleResponse(res, err, {}, null, req["context"].getStatusCode(null));
        });
});

router.post("/*", function (req, res) {

    const svc = new Service(req["context"].entity);

    svc.add(req.body, (err, data) => {
        handleResponse(res, err, data, null, req["context"].getStatusCode(err));
    });
});

router.put("/*", function (req, res) {

    const svc = new Service(req["context"].entity);

    if (req["context"].params.length > 0) {
        svc.update(req["context"].params[0], req.body, (err, data) => {
            handleResponse(res, err, data, null, req["context"].getStatusCode(err));
        });
    }
    else {
        handleResponse(res, new Error(`You need to specify the "_id" of the target document to update. Massive updates are forbidden.
            Following context Details:
            Req URL: "${encodeURI(req["context"].url)}"`), {}, null, HttpStatus.BAD_REQUEST);
    }
});

router.delete("/*", function (req, res) {

    const svc = new Service(req["context"].entity);

    if (req["context"].params.length > 0) {
        svc.delete(req["context"].params[0], (err, data) => {
            handleResponse(res, err, data, null, req["context"].getStatusCode(err));
        });
    }
    else {
        handleResponse(res, new Error(`You need to specify the "_id" of the target document to delete. Massive deletions are forbidden.
        Following context Details:
        Req URL: "${encodeURI(req["context"].url)}"`), {}, null, HttpStatus.BAD_REQUEST);
    }
});

function handleResponse(res, err, data, headers, statusCode) {
    res.status(statusCode).json(new ResponseBody(err, data, headers));
}

module.exports = router;