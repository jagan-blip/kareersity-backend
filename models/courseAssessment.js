const mongoose = require('mongoose');
const config = require("../nodedetails/config");

const assessmentSchema = new mongoose.Schema({

    "courseId": {
        type: mongoose.Schema.Types.ObjectId,
        ref: "MainCourse",
        default: ""
    },
    "sessionId": {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Session",
        default: ""
    },
    "question": {
        type: String,
        required: true
    },
    "options": [{
        type: String,
        required: true
    }],
    "correctAnswer": {
        type: String,
        required: true
    }


}, { versionKey: false, timestamps: true })

module.exports = mongoose.model('Assessment', assessmentSchema, config.dbPrefix + 'TNEMSSESSA')