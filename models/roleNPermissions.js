const mongoose = require('mongoose');
const config = require("../nodedetails/config");

const rolesAndPermissionsSchema  = new mongoose.Schema({

    "roleId": {
        type: String,
        default: ""
       
    },
    
    "section": {
        type: String,
        default: ""
    },
   
    "permissions": [{
        type: String,
        enum: ['view', 'edit','delete']
    }],
  
}, { versionKey: false, timestamps: true })

module.exports = mongoose.model('RolesAndPermissions', rolesAndPermissionsSchema , config.dbPrefix + 'SNOISSIMREPDNASELOP')