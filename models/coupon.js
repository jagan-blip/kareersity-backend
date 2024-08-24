const mongoose = require('mongoose');
const config = require("../nodedetails/config");
const CouponSchema = new mongoose.Schema({
   
    "couponName": {
        type: String,
        unique:true,
        default: ""
    },

    "validFrom": {
        type: Date,
        default: null
    },

    "validTill": {
        type: Date,
        default: null
    },

    "couponType": { 
        type: String,
        enum:["course","subscription"]
       
    },
    "selectedCourses": [String],
    "selectedSubscriptions": [String],

    "discountType": {     
        type: String,
        enum:["percentage","price"]
       
    },
    "couponValue": {     
        type: Number,
        default :0
       
    },
    "isActive": {     
        type: Boolean,
        default :false
       
    }
 

}, { versionKey: false, timestamps: true })

module.exports = mongoose.model('Coupon', CouponSchema, config.dbPrefix + 'NOPUOC')