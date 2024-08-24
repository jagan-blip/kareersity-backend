const mongoose = require('mongoose');
const config = require("../nodedetails/config");

const FAQSchema = new mongoose.Schema({

    
    "question": {
        type: String,
        default: ""
    },
    "answer": {
        type: String,
        default: ""
    },
    "isActive": {
        type: Boolean,
        default: true
    }
   

}, { versionKey: false, timestamps: true })

module.exports = mongoose.model('FAQ',FAQSchema, config.dbPrefix + 'SQAF')