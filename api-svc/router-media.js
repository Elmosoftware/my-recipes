// @ts-check

var express = require("express");
var routerMedia = express.Router();

var Context = require("./request-context");
const Service = require("./media-service");

//Middleware function specific to this route:
routerMedia.use(function (req, res, next) {

    //Do anything required here like logging, etc...

    let options = new Context.RequestContextOptions();

    options.disableEntityCheck = true; //Media API doesn't use entities.
    options.doNotApplyConfiguredDelay = true; //Configured delay doesn't apply to this API.
    options.validEndpoints = [ "carousel" ];
    
    req["context"] = new Context.RequestContext(req, res, options);

    //If the request is not valid, the RequestContext class already sent the response with the error
    //details, so no need to call next middleware.
    if (req["context"].isValidRequest) {
        next();
    }
});

routerMedia.get("/carousel/*", (req, res) => {

    const svc = new Service();

    svc.getCarouselPictures((err, data) => {
        req["context"].sendResponse(err, data);
    });
})

module.exports = routerMedia;