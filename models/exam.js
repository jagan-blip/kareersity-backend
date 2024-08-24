const mongoose = require('mongoose');
const config = require("../nodedetails/config");

const examSchema = new mongoose.Schema({


    "userId": {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: ""
    },
    "sessionId": {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Session",
        default: ""
    },
    "examInfo": [{
        "_id": false,
        "questionId": {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Assessment",
            default: ""
        },
        "yourAnswer": {
            type: String,
            default: ""
        },
        "isAnswered": {
            type: Boolean,
            default: false
        }
    }],
    "obtainedMarks": {
        type: Number,
        default: 0
    },
    "maximumMarks": {
        type: Number,
        default: 0
    }

}, { versionKey: false, timestamps: true })

module.exports = mongoose.model('Exam', examSchema, config.dbPrefix + 'MAXE')