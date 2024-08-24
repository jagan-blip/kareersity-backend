const mongoose = require('mongoose');
const config = require("../nodedetails/config");

const educatorSchema = new mongoose.Schema({

    "name": {
        type: String,
        default: ""
    },
    "email": {
        type: String,
        default: ""
    },
    "phoneNumber": {
        type: String,
        default: ""
    },
    "password": {
        type: String,
        default: ""
    },
    "city": {
        type:String ,
        default: ""
    },
    "expertise": {
        type:String ,
        default: ""
    },
    "photoUrl": {
        type:String ,
        default: ""
    },
    "designation": {
        type:String ,
        default: ""
    },
    "description": {
        type:String ,
        default: ""
    },
    "cvUrl": {
        type:String ,
        default: ""
    },
    "course1Url": {
        type:String ,
        default: ""
    },
    "course2Url": {
        type:String ,
        default: ""
    },
    "isVerified": {
        type:Boolean ,
        default: false
    },
    "status": {
        type:String ,
        default: "inActive"
    }

}, { versionKey: false, timestamps: true })

module.exports = mongoose.model('Educator', educatorSchema, config.dbPrefix + 'ROTACUDE')