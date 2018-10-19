// @ts-check

var express = require("express");
var router = express.Router();
var HttpStatus = require("http-status-codes");
var ManagementClient = require('auth0').ManagementClient;
var manage = new ManagementClient({
    domain: process.env.AUTHMANAGEMENT_DOMAIN,
    clientId: process.env.AUTHMANAGEMENT_CLIENT_ID,
    clientSecret: process.env.AUTHMANAGEMENT_CLIENT_SECRET,
    scope: process.env.AUTHMANAGEMENT_SCOPE
  });

var RequestContext = require("./request-context");
const ResponseBody = require("./response-body");

//Middleware function specific to this route:
router.use(function (req, res, next) {
    //Do anything required here like logging, etc...

    req["context"] = new RequestContext(req);

    //Setting CORS Headers:
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", req["context"].getAllowedHTTPMethods().join(", "));
    res.setHeader("Access-Control-Allow-Headers", "Origin, Content-Type, X-Auth-Token");

    //Check if the method is supported:
    if (!req["context"].isMethodAllowed) {
        handleResponse(res, new Error(`The requested method is not supported by this API. Method: "${encodeURI(req["context"].method)}"`),
            {}, null, req["context"].getStatusCode(null));
        return;
    }

    next();
});

router.get("/user/*", (req, res) => {

    if (req["context"].params.length > 0) {       
        manage.getUser({ id: req["context"].params[0] }, (err, userProfile) => {
            handleResponse(res, err, userProfile, null, req["context"].getStatusCode(err))
        });    
    }
    else{
        handleResponse(res, new Error(`You need to specify the "user_id" of the currently logged user. You cannot request information for multiple users.
            Following context Details:
            Req URL: "${encodeURI(req["context"].url)}"`), {}, null, HttpStatus.BAD_REQUEST);
    }   
})

router.put("/user/*", (req, res) => {

    if (req["context"].params.length > 0) {       
        manage.updateUser({ id: req["context"].params[0] }, req.body, (err, userProfile) => {
            handleResponse(res, err, userProfile, null, req["context"].getStatusCode(err))
        });    
    }
    else{
        handleResponse(res, new Error(`You need to specify the "user_id" of the currently logged user. You cannot update information for multiple users.
            Following context Details:
            Req URL: "${encodeURI(req["context"].url)}"`), {}, null, HttpStatus.BAD_REQUEST);
    }   
})

function handleResponse(res, err, data, headers, statusCode) {
    res.status(statusCode).json(new ResponseBody(err, data, headers));
}

module.exports = router;