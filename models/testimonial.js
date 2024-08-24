const mongoose = require('mongoose');
const config = require("../nodedetails/config");

const testimonialSchema = new mongoose.Schema({

    
    "name": {
        type: String,
        default: ""
    },
    "qualification": {
        type: String,
        default: ""
    },
    // "thumbnail": {
    //     type: String,
    //     default: ""
    // },
    "videoUrl": {
        type: String,
        default: ""
    },
    "feedback": {
        type: String,
        default: ""
    },
    "isActive": {
        type: Boolean,
        default: true
    }
   

}, { versionKey: false, timestamps: true })

module.exports = mongoose.model('testimonial',testimonialSchema, config.dbPrefix + 'LAINOMITSET')