const mongoose = require('mongoose');
const config = require("../nodedetails/config");
// free for beased on college list

const institutionSchema = new mongoose.Schema({

    name: { type: String, required: true },
      
    state: { type: String, required: true },

    statePharmacyCouncil: { type: String, required: true },

    contactUs: { type: String, required: true }
   

}, { versionKey: false, timestamps: true })

module.exports = mongoose.model('Institution',institutionSchema, config.dbPrefix + 'NOITUTITSNI')