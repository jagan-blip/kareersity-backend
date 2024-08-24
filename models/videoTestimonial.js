const mongoose = require('mongoose');
const config = require("../nodedetails/config");

const VideoTestimonialSchema = new mongoose.Schema({

    
  
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

module.exports = mongoose.model('VideoTestimonial',VideoTestimonialSchema, config.dbPrefix + 'LAINOMITSETOEDIV')