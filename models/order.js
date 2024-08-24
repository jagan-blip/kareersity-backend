const mongoose = require('mongoose');
const config = require("../nodedetails/config");

const OrderSchema = new mongoose.Schema({

    "userId": {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    "items": [{
        "_id": false,
        "courseId": {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'MainCourse',
            required: true
        }
    }],
    
    "totalMrp": { type: Number, default: 0 },

    "totalDiscountedPrice": { type: Number, default: 0 },

    "totalItems": { type: Number, default: 0 },

    "status": { type: String, default: "pending" },

    "billingDetails": { type: Object, default: {} },

    "paymentDetails": { type: Object, default: {} },

}, { versionKey: false, timestamps: true })

module.exports = mongoose.model('Order', OrderSchema, config.dbPrefix + 'REDRO')