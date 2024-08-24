const mongoose = require('mongoose');
const config = require("../nodedetails/config");

const AdminNotificationSchema = new mongoose.Schema({

    "userId": { type: mongoose.Schema.Types.ObjectId, default: "" },

    "adminId": { type: mongoose.Schema.Types.ObjectId, default: "" },

    "redirectId": { type: mongoose.Schema.Types.ObjectId, default: "" },

    "message": { type: String, default: "" }

}, { versionKey: false, timestamps: true })


module.exports = mongoose.model('Admin Notification', AdminNotificationSchema, config.dbPrefix + 'NOITACIFITONNIMDA')