// @ts-check

var express = require("express");
var routerManagement = express.Router();
var HttpStatus = require("http-status-codes");
var ManagementClient = require('auth0').ManagementClient;
var manage = new ManagementClient({
    domain: process.env.AUTHMANAGEMENT_DOMAIN,
    clientId: process.env.AUTHMANAGEMENT_CLIENT_ID,
    clientSecret: process.env.AUTHMANAGEMENT_CLIENT_SECRET,
    scope: process.env.AUTHMANAGEMENT_SCOPE
  });

var Context = require("./request-context");

//Middleware function specific to this route:
routerManagement.use(function (req, res, next) {

    //Do anything required here like logging, etc...

    let options = new Context.RequestContextOptions();

    options.disableEntityCheck = true; //Management API doesn't use entities.
    options.doNotApplyConfiguredDelay = true; //Configured delay doesn't apply to this API.

    req["context"] = new Context.RequestContext(req, res, options);

    //If the request is not valid, the RequestContext class already sent the response with the error
    //details, so no need to call next middleware.
    if (req["context"].isValidRequest) {
        next();
    }
});

routerManagement.get("/user/*", (req, res) => {

    if (req["context"].params.length > 0) {       
        manage.getUser({ id: req["context"].params[0] }, (err, userProfile) => {
            req["context"].sendResponse(err, userProfile); 
        });    
    }
    else{
        req["context"].sendResponse(new Error(`You need to specify the parameter "user_id". You cannot request information for multiple users.
            Following context Details:
            Req URL: "${encodeURI(req["context"].url)}"`), {}, HttpStatus.BAD_REQUEST);
    }   
})

routerManagement.put("/user/*", (req, res) => {

    if (req["context"].params.length > 0) {       
        manage.updateUser({ id: req["context"].params[0] }, req.body, (err, userProfile) => {
            req["context"].sendResponse(err, userProfile); 
        });    
    }
    else{
        req["context"].sendResponse(new Error(`You need to specify the "user_id" of the currently logged user. You cannot update information for multiple users.
            Following context Details:
            Req URL: "${encodeURI(req["context"].url)}"`), {}, HttpStatus.BAD_REQUEST);
    }   
})

module.exports = routerManagement;