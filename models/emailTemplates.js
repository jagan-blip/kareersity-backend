const mongoose = require('mongoose');
const config = require("../nodedetails/config");

const emailTemplateSchema = new mongoose.Schema({

    templateName: { type: String, required: true },

    //greeting: { type: String, required: true },

    subject: { type: String, required: true },
    
    body: { type: String, required: true }
   

}, { versionKey: false, timestamps: true })

module.exports = mongoose.model('EmailTemplate',emailTemplateSchema, config.dbPrefix + 'ETALPMETLIAME')