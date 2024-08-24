const mongoose = require('mongoose');
const config = require("../nodedetails/config");

const jobSchema = new mongoose.Schema({
    
    "title": {
        type: String,
        default: ""
    },
    // "description": {
    //     type: String,
    //     default: ""
    // },
    // internship , entry / senior level
    "experienceLevel": [{
        type: String,
        default: ""
    }],

    // Biotechnology Research,Analytical Chemistry ,Pharmaceutical Engineering ,Project Management Office (PMO) ,Clinical Operations
    "department": [{
        type: String,
        default: ""
    }],
    // contract , full/part time
    "jobType": [{
        type: String,
        default: ""
    }],
    // remote , on-site , hybrid
    "remote": [{
        type: String,
        default: ""
    }],
    "location": [{
        type: String,
        default: ""
    }],

    "lastDateForApply": {
        type: String,
        default: ""
    },
   
    "isActive": {
        type: Boolean,
        default: false
    },
   

}, { versionKey: false, timestamps: true })

module.exports = mongoose.model('Jobs', jobSchema, config.dbPrefix + 'BOJS')