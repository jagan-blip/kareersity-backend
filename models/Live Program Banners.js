const mongoose = require('mongoose');
const config = require("../nodedetails/config");
 // main LiveProgrambanner 30000+ phrmaceutical companies....
const LiveProgramBannerSchema = new mongoose.Schema({
   
    "thumbnail": {
        type: String,
        default: ""
    },
    "bannerFor": {       //display list of type
        type: String,
        default: ""
    },
    "videoUrl": {
        type: String,
        default: ""
    },
    "isActive": {
        type: Boolean,
        default: true
    }
   

}, { versionKey: false, timestamps: true })

module.exports = mongoose.model('LiveProgramBanner', LiveProgramBannerSchema, config.dbPrefix + 'RENNABMARGORPEVIL')