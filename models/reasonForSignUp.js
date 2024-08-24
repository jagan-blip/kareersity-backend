const mongoose = require('mongoose');
const config = require("../nodedetails/config");

const reasonForSignUpSchema = new mongoose.Schema({
    

    "reason": {
        type: String,
        default: ""
    },
    "isActive": {
        type: Boolean,
        default: false
    },
    

}, { versionKey: false, timestamps: true })

module.exports = mongoose.model('UserReasonForSignUp', reasonForSignUpSchema, config.dbPrefix + 'PUNGISROFNOSAERRESU')