const mongoose = require('mongoose');
const config = require("../nodedetails/config");

const listenToExpertsSchema = new mongoose.Schema({

    
    "title": {
        type: String,
        default: ""
    },
    "thumbnail": {
        type: String,
        default: ""
    },
    "videoUrl": {
        type: String,
        default: ""
    },
    "isActive": {
        type: Boolean,
        default: true
    }
   

}, { versionKey: false, timestamps: true })

module.exports = mongoose.model('ListenToExperts', listenToExpertsSchema, config.dbPrefix + 'STREPXEOTNETSIL')