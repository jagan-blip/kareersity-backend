const mongoose = require('mongoose');
const config = require("../nodedetails/config");
 // main SubscriptionBanner 30000+ phrmaceutical companies....
const SubscriptionBannerSchema = new mongoose.Schema({
   
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

module.exports = mongoose.model('NewSubscriptionBanner', SubscriptionBannerSchema, config.dbPrefix + 'RENNABSUBSWEN')