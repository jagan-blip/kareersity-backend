const mongoose = require('mongoose');
const config = require("../nodedetails/config");

const blogsSchema = new mongoose.Schema({

    
    "title": {
        type: String,
        default: ""
    },
    "thumbnail": {
        type: String,
        default: ""
    },
    "sDesc": {
        type: String,
        default: ""
    },
    "dDesc": {
        type: String,
        default: ""
    },
    "isActive": {
        type: Boolean,
        default: true
    }
   

}, { versionKey: false, timestamps: true })

module.exports = mongoose.model('Blog', blogsSchema, config.dbPrefix + 'GOLB')