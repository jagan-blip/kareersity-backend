const mongoose = require('mongoose');
const config = require("../nodedetails/config");

const countryStatesSchema = new mongoose.Schema({

    "country": {
        type: String,
        default: ""
    },
    "state": [{
        type: String,
        default: ""
    }],
    // "city": [{
    //     type: String,
    //     default: ""
    // }]

}, { versionKey: false, timestamps: true })

module.exports = mongoose.model('CountryStates', countryStatesSchema, config.dbPrefix + 'SETATSYRTNUOC')