const mongoose = require('mongoose');
const config = require("../nodedetails/config");

const categorySchema  = new mongoose.Schema({

    "name": {
        type: String,
        default: ""
    },
    "description": {
        type: String,
        default: ""
    },
    "isHidden": {
        type: Boolean,
        default: false
    }

}, { versionKey: false, timestamps: true })

module.exports = mongoose.model('Category', categorySchema , config.dbPrefix + 'YROGETAC')