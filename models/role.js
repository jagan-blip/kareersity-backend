const mongoose = require('mongoose');
const config = require("../nodedetails/config");

const roleSchema  = new mongoose.Schema({

    
    "role": {
        type: String,
        unique :true
       
    },
    //jwt secret for dynamic role initially it was in local.js
    "secret": {
        type: String,
        default :''
       
    },
    "isActive": {
        type: Boolean,
        default : false
    },
  
}, { versionKey: false, timestamps: true })

module.exports = mongoose.model('Role', roleSchema , config.dbPrefix + 'ELOR')