const mongoose = require('mongoose');
const config = require("../nodedetails/config");

const lessonSchema = new mongoose.Schema({

    "lessonNo": {
        type: Number,
        default: 1
    },
    "title": {
        type: String,
        default: ""
    },
    "duration": {
        type: String,
        default: ""
    },
    "fileName": {
        type: String,
        default: ""
    },
    "videoUrl": {
        type: String,
        default: ""
    },
    "isFreeVideo": {
        type: Boolean,
        default: false
    },
    // "accessLevel": {
    //     type: String,
    //     enum: ["basic", "standard", "premium"],
    //     default: "basic"
    // },
    "sessionId": {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Session",
        default: ""
    },
    "courseId": {
        type: mongoose.Schema.Types.ObjectId,
        ref: "MainCourse",
        default: ""
    }

}, { versionKey: false, timestamps: true })

module.exports = mongoose.model('Lesson', lessonSchema, config.dbPrefix + 'NOSSEL')