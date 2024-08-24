const mongoose = require('mongoose');
const config = require("../nodedetails/config");

const addressSchema = new mongoose.Schema({

    "userId": {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: ""
    },

    "addressLine": {
        type: String,
        default: ""
    },
    "city": {
        type: String,
        default: ""
    },
    "state": {
        type: String,
        default: ""
    },
    "country": {
        type: String,
        default: ""
    },
    
    "pinCode": {
        type: Number,
        default: 0
    }
    
    

}, { versionKey: false, timestamps: true })

module.exports = mongoose.model('Address', addressSchema, config.dbPrefix + 'SSERDDA')