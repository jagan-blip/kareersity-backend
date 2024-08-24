const mongoose = require('mongoose');
const config = require("../nodedetails/config");

const academicSchema = new mongoose.Schema({

    "userId": {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: ""
    },
    "collegeId": {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Institution",
        default: ""
    },
    "collegeName": {
        type: String,
        default: ""
    },
    "yearOfCollege": {
        type: String,
        default: ""
    },
    "city": {
        type: String,
        default: ""
    },
    "pinCode": {
        type: Number,
        default: 0
    },

    "degreeOfStream": {
        type: String,
        default: ""
    },

}, { versionKey: false, timestamps: true })

module.exports = mongoose.model('Academic', academicSchema, config.dbPrefix + 'CIMEDACA')