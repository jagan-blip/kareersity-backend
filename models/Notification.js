const mongoose = require('mongoose');
const config = require("../nodedetails/config");

const NotificationSchema = new mongoose.Schema({

    "userId": { type: mongoose.Schema.Types.ObjectId, default: "" },

    "message": { type: String, default: "" },
    
    "isRead": { type: Boolean, default: false }

}, { versionKey: false, timestamps: true })


module.exports = mongoose.model('Notification', NotificationSchema, config.dbPrefix + 'NOITACIFITON ')