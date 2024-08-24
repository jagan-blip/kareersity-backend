const mongoose = require('mongoose');
const config = require("../nodedetails/config");

const applicantSchema = new mongoose.Schema({

    "jobId": {
        type: String,
        default: ""
    },
    "jobTitle": {
        type: String,
        default: ""
    },
    "positionAppliedFor": {
        type: String,
        default: ""
    },
    // "jobCategory": {
    //     type: String,
    //     default: ""
    // },

    "fullName": {
        type: String,
        default: ""
    },

    "gender": {
        type: String,
        default: ""
    },

    "emailId": {
        type: String,
        default: ""
    },
    "phoneNumber": {
        type: String,
        default: ""
    },

    "address": {
        type: String,
        default: ""
    },

    "city": {
        type: String,
        default: ""
    },

    "pincode": {
        type: String,
        default: ""
    },
    "totalWorkExperience": {
        type: String,
        default: ""
    },
    "lastEmployer": {
        type: String,
        default: ""
    },
    // "preferredLocation": {
    //     type: String,
    //     default: ""
    // },
    // "jobType": {
    //     type: String,
    //     default: ""
    // },
    //how did you heard about us?
    "source": {
        type: String,
        default: ""
    },
    "cv": {
        type: String,
        default: ""
    }


}, { versionKey: false, timestamps: true })

module.exports = mongoose.model('JobApplicants', applicantSchema, config.dbPrefix + 'BOJSTNACILPPA')