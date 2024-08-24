const mongoose = require('mongoose');
const config = require("../nodedetails/config");

const trainingInstallmentsSchema = new mongoose.Schema({

  "title": {
    type: String,
    required: true,
    enum: [1, 2, 3, 4, 5, 6],
    unique:true
  },
  "amount": {
    type: Number,
    required: true,
  },

}, { versionKey: false, timestamps: true })

module.exports = mongoose.model('TrainingInstallment', trainingInstallmentsSchema, config.dbPrefix + 'TNEMLLATSNIGNINIART')