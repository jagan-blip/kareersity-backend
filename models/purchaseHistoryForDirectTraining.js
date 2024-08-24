const mongoose = require('mongoose');
const config = require("../nodedetails/config");

const purchaseHistoryForDirectTrainingSchema = new mongoose.Schema({

    "traineeId": {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Training'
    },

    "installmentInfo": {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TrainingInstallment',

    },
    "paidForMonth": { type: Date , default: null },

    "status": { type: String },


    "paymentDetails": { type: Object, default: {} },

}, { versionKey: false, timestamps: true })

module.exports = mongoose.model('PurchaseHistoryForDirectTraining', purchaseHistoryForDirectTrainingSchema, config.dbPrefix + 'GNIIARTTCERIDROFYROTSIHESAHCRUP')