const mongoose = require('mongoose');
const config = require("../nodedetails/config");

const bundleSchema = new mongoose.Schema({

    "title": {
        type: String,
        required: true
    },
    "selectedCourses": [{
        type: String,
        required: true
    }],
    "totalPrice": {
        type: Number,
        required: true
    },
    "discountedPrice": {
        type: Number,
        required: true
    },
    "isActive": {
        type: Boolean,
        default:false
    }

}, { versionKey: false, timestamps: true })

module.exports = mongoose.model('CourseBundle', bundleSchema, config.dbPrefix + 'ELDNUBESRUOC')