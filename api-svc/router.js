// @ts-check

var express = require("express");
var routerData = express.Router();
var HttpStatus = require("http-status-codes");
var Context = require("./request-context");
const Service = require("./service");

//Middleware function specific to this route:
routerData.use(function (req, res, next) {

    //Do anything required here like logging, etc...

    req["context"] = new Context.RequestContext(req, res);
    
    //If the request is not valid, the RequestContext class already sent the response with the error
    //details, so no need to call next middleware:
    if (req["context"].isValidRequest) {
        next();
    }
});

routerData.get("/*", function (req, res) {

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
        promises.push(svc.count(condition, req["context"].user, req["context"].query));
    }

    promises.push(svc.find(condition, projection, req["context"].user, req["context"].query));

    Promise.all(promises)
        .then((results) => {
            try {
                if (isCounting) {
                    req["context"].addResponseHeader("X-Total-Count", results[0], true);
                }
                
                req["context"].sendResponse(null, results[results.length-1]);

            } catch (err) {
                req["context"].sendResponse(err, {});
            }
        })
        .catch((err) => {
            req["context"].sendResponse(err, {});
        });
});

routerData.post("/*", function (req, res) {

    const svc = new Service(req["context"].entity);

    svc.add(req.body, req["context"].user, (err, data) => {
        req["context"].sendResponse(err, data);
    });
});

routerData.put("/*", function (req, res) {

    const svc = new Service(req["context"].entity);

    if (req["context"].params.length > 0) {
        svc.update(req["context"].params[0], req.body, req["context"].user, (err, data) => {
            req["context"].sendResponse(err, data);
        });
    }
    else {
        req["context"].sendResponse(new Error(`You need to specify the "_id" of the target document to update. Massive updates are forbidden.
            Following context Details:
            Req URL: "${encodeURI(req["context"].url)}"`), {}, HttpStatus.BAD_REQUEST);
    }
});

routerData.delete("/*", function (req, res) {

    const svc = new Service(req["context"].entity);

    if (req["context"].params.length > 0) {
        svc.delete(req["context"].params[0], req["context"].user, req["context"].query, (err, data) => {
            req["context"].sendResponse(err, data);
        });
    }
    else {
        req["context"].sendResponse(new Error(`You need to specify the "_id" of the target document to delete. Massive deletions are forbidden.
        Following context Details:
        Req URL: "${encodeURI(req["context"].url)}"`), {}, HttpStatus.BAD_REQUEST);
    }
});

module.exports = routerData;