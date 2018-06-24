// @ts-check

const DEV_PORT = 3000;
const result = require('dotenv').config({ path: __dirname + '/.env' })
const express = require("express");
var bodyParser = require("body-parser");
const app = express();
var mongoose = require("mongoose");
var router = require("./router");
const ConfigValidator = require("./config-validator");
const cfgVal = new ConfigValidator();

console.log("\n -----  MY RECIPES API  -----\n");
console.log("APP Configuration:");

//Id dotenv was not able to parse the ".env" file:
if (result.error) {
    throw result.error;
}

//We validate the configuration is there and has valid settings:
if (!cfgVal.validateConfig().isValid) {
    throw new Error(`The following configuration errors prevent the application to start:\n${cfgVal.getErrors().message}
    Please, review your ".env" file and adjust it accordingly.`);
}

console.log(JSON.stringify(result.parsed) + "\n");

//As a safe-guard, we modify specific environment related settings:
//We must not add delay to request in PROD env:
if (process.env.NODE_ENV == "prod" && Number(process.env.REQUESTS_ADDED_DELAY) >= 0) {
    process.env.REQUESTS_ADDED_DELAY = "0"
    console.error(`Environment is "prod', so REQUESTS_ADDED_DELAY was set to "0".`)
}

//If we are in dev environment, we need to set the PORT environment variable:
if (process.env.NODE_ENV == "dev") {
    process.env.PORT = String(DEV_PORT);
    console.warn(`Environment is "dev', so PORT was set to "${process.env.PORT}".`)
}

mongoose.Promise = global.Promise; // Using native promises.

app.use(bodyParser.json()); // to support JSON-encoded bodies.
app.use(bodyParser.urlencoded({ extended: true })); // to support URL-encoded bodies.
app.use("/api", router);

mongoose.connect(process.env.DB_ENDPOINT, { useMongoClient: true }, function (err) {
    if (err) {
        console.log("There was an error connecting to Mongo instance. Error description:\n" + err);
    }
    else {
        console.log("Successfully connected to Mongo instance!");
    }
});

app.listen(process.env.PORT, () => {
    console.log(`Server running at http://localhost:${process.env.PORT}/`);
    console.log(`Environment: ${process.env.NODE_ENV}`);

    if (process.env.NODE_ENV == "dev" && process.env.REQUESTS_ADDED_DELAY && Number(process.env.REQUESTS_ADDED_DELAY) > 0) {
        console.warn(`\n\nWarning!, the configuration value REQUESTS_ADDED_DELAY is established to ${process.env.REQUESTS_ADDED_DELAY} milliseconds.
        This is normally used for debugging purposes and to emulate production environment conditions.\n`)
    }

    if (process.env.NODE_ENV == "prod") {
        console.warn(`\n\nCURRENT ENVIRONMENT SETTINGS CORRESPONDS TO: PRODUCTION SITE.\n`)
    }

    console.log(`Executing on folder: ${__dirname}`);
    console.log(`Executing script: ${__filename}`);
    console.log("\nServer is ready!\n");
});
