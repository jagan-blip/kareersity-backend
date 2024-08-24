const mongoose = require('mongoose');
const config = require("../nodedetails/config");

const cartSchema = new mongoose.Schema({

    "userId": {
        type: mongoose.Schema.Types.ObjectId
        ,
        ref: 'User',
        required: true,
        unique: true
    },

    "items": [{
        "_id": false,
        "courseId": {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'MainCourse',
            required: true
        }
    }]

}, { versionKey: false ,timestamps:true})

module.exports = mongoose.model('Cart', cartSchema, config.dbPrefix + 'TRAC')