const mongoose = require('mongoose');
const config = require("../nodedetails/config");

const professionalEduSchema = new mongoose.Schema({

    "userId": {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: ""
    },

    "companyName": {
        type: String,
        default: ""
    },
    "designation": {
        type: String,
        default: ""
    },
    "totalExperince": {
        type: String,
        default: ""
    },
    "degreeOfStream": {
        type: String,
        default: ""
    },
    "city": {
        type: String,
        default: ""
    },
    "pinCode": {
        type: Number,
        default: 0
    }
  

}, { versionKey: false, timestamps: true })

module.exports = mongoose.model('ProfessionalEdu', professionalEduSchema, config.dbPrefix + 'UDELANOISSEFORP')