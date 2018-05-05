// @ts-check

const express = require("express");
var bodyParser = require("body-parser");
const port = 3000;
const app = express();
var mongoEndpoint = "mongodb://localhost:27017/my-recipes-api";
var mongoose = require("mongoose");
var router = require("./router");

mongoose.Promise = global.Promise; // Using native promises.

app.use(bodyParser.json()); // to support JSON-encoded bodies.
app.use(bodyParser.urlencoded({ extended: true })); // to support URL-encoded bodies.
app.use("/api", router);

mongoose.connect(mongoEndpoint, { useMongoClient: true }, function (err) {
    if (err) {
        console.log("There was an error connecting to Mongo instance. Error description:\n" + err);
    }
    else {
        console.log("Successfully connected to Mongo instance!");
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
    console.log(`Executing on folder: ${__dirname}`);
    console.log(`Executing script: ${__filename}`);
    console.log("Server is ready!\n");
});
