const mongoose = require('mongoose');
const config = require("../nodedetails/config");

const userMyCoursesSchema = new mongoose.Schema({

    "userId": {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    "courseId": {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MainCourse',
        required: true
    },
    "planId": {
        type:String,
        default:""
       
    },
    "courseName":{
        type:String,
        default:""
    },
    "thumbnail":{
        type:String,
        default:""
    },
    "courseLevel":{
        type:String,
        default:""
    },

    "watchedHistory": [{
        "_id":false,
        "sessionId": { type: String, default: " " },
        "lessons": [{
            "_id":false,
            "lessonId": { type: String, default: " " },
            "lessonWatchedDuration": { type: Number, default: 0 },
            "lessonTotalDuration": { type: Number, default: 0 },
            "isLessonCompleted": { type: Boolean, default: false },
            
        }],
        "sessionWatchedDuration": { type: Number, default: 0 },
        "sessionTotalDuration": { type: Number, default: 0 },
        "isSessionCompleted": { type: Boolean, default: false }
    }],
    "isCourseCompleted": { type: Boolean, default: false },

    "totalWatchedDuration": { type: Number, default: 0 },

    "courseDuration": { type: Number, default: 0 },

    "validTill": { type: Date, default: null },

    "certUrl":{  type:String, default:"" },


}, { versionKey: false, timestamps: true })

module.exports = mongoose.model('UserMyCourses', userMyCoursesSchema, config.dbPrefix + 'SESRUOCYMRESU')