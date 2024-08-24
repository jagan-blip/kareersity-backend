const mongoose = require('mongoose');
const config = require("../nodedetails/config");
// course bundle banner 5couses at 1000 e.g.
const subscriptionBannerSchema = new mongoose.Schema({
   
    "title": {
        type: String,
        default: ""
    },
    "content1": {
        type: String,
        default: ""
    },
    "content2": {      
        type: String,
        default: ""
    },
    "thumbnail": {
        type: String,
        default: ""
    },
    "bannerFor": {       //display list of type
        type: String,
        default: ""
    },
    "url": {
        type: String,
        default: ""
    },
    "isActive": {
        type: Boolean,
        default: true
    }
   

}, { versionKey: false, timestamps: true })

module.exports = mongoose.model('SubscriptionBanner', subscriptionBannerSchema, config.dbPrefix + 'RENNABNOITPIRCSBUS')