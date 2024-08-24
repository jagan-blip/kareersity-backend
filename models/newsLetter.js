const mongoose = require('mongoose');
const config = require("../nodedetails/config");

const newsLetter = new mongoose.Schema({

    "email": { type: String, default: "" },

    "isSubscribed": { type: Boolean, default: false }

}, { versionKey: false, timestamps: true })


module.exports = mongoose.model('NewsLetter', newsLetter, config.dbPrefix + 'RETTELSWEN ')