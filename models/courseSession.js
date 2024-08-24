const mongoose = require('mongoose');
const config = require("../nodedetails/config");

const sessionSchema = new mongoose.Schema({

    "sessionNo": {
        type: Number,
        default: 1
    },
    "title": {
        type: String,
        default: ""
    },
    "courseId": {
        type: mongoose.Schema.Types.ObjectId,
        ref: "MainCourse",
        default: ""
    }

}, { versionKey: false, timestamps: true })

module.exports = mongoose.model('Session', sessionSchema, config.dbPrefix + 'NOISSES')