const mongoose = require('mongoose');
const config = require("../nodedetails/config");

const userSubscriptionPlan = new mongoose.Schema({
   
    "userId": {
        type: String,
        default: ""
    },
    "planId": {
        type: String,
        default: ""
    },
    "planName": {
        type: String,
        default: ""
    },
    "price": {
        type: Number,
        default: 0
    },
    "couponCode": {
        type: String,
        default: ""
    },
    "couponDiscount": {
        type: Number,
        default: 0
    },
    "renewalDate": {
        type: Date,
        default: ""
    },
    "validTill": {
        type: Date,
        default: ""
    },
    "paymentInfo": {},
    
    "isActive": {
        type: Boolean,
        default: false
    }
   

}, { versionKey: false, timestamps: true })

module.exports = mongoose.model('UserSubscriptionPlan', userSubscriptionPlan, config.dbPrefix + 'NALPNOITPIRCSBUSRESU')