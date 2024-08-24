const mongoose = require('mongoose');
const config = require("../nodedetails/config");

const subscriptionPlanBannerSchema = new mongoose.Schema({
   
    "planName": {
        type: String,
        required: true,
       
    },
    "oneMonthPrice": {
        type: Number,
        required: true,
       
    },
    "threeMonthPrice": {
        type: Number,
        required: true,
        
    },
    "sixMonthPrice": {
        type: Number,
        required: true,
       
    },
    "twelveMonthPrice": {
        type: Number,
        required: true,
       
    },
    "features": [{      
        type: String,
        required: true,
       
    }],
    "courseBundles": [{
        type: String,
        required: true,
       
    }],
   
    "isActive": {
        type: Boolean,
        default: false
    }
   

}, { versionKey: false, timestamps: true })

module.exports = mongoose.model('SubscriptionPlanBanner', subscriptionPlanBannerSchema, config.dbPrefix + 'RENNABNALPNOITPIRCSBUS')