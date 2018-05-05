// @ts-check

/*
class *Level*
    Name:
        type: String
        desc: Name of the Level.
        req: true
        unique: true
        note: So far the following levels will be added:
            - Beginner
            - Intermediate
            - Expert
    Description:
        type: String
        desc: Level Description.
end class
*/

var mongoose = require("mongoose");

module.exports = mongoose.model("Level",
    new mongoose.Schema({
        name: { type: String, required: true, unique: true },
        description: { type: String, required: true }
    }));
