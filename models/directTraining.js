const mongoose = require("mongoose");
const config = require("../nodedetails/config");

const trainingSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    mobileNumber: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    designation: {
      type: String,
      required: true,
    },
    qualification: {
      type: String,
      required: true,
    },
    currentAddress2: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    pincode: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    pcurrentAddress: {
      type: String,
      required: true,
    },
    pcurrentAddress2: {
      type: String,
      required: true,
    },
    pcity: {
      type: String,
      required: true,
    },
    ppincode: {
      type: String,
      required: true,
    },
    pstate: {
      type: String,
      required: true,
    },
    subQualification: {
      type: String,
    },
    role: {
      type: String,
      // enum: ["Fresher", "Level 1", "Level 2", "Level 3", "Level 4", "Level 5"],
      required: true,
    },
    companyName: {
      type: String,
    },
    experience: {
      type: Number,
      // enum: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
    },
    headQuarter: {
      type: String,
    },
    currentAddress: {
      type: String,
    },
    permanentAddress: {
      type: String,
    },
    purpose: {
      type: String,
      enum: ["Knowledge Upgrade", "Promotion", "Choosing New Career Path"],
      required: true,
    },
    selectedCentre: {
      type: String,
      enum: ["KOTA"],
      required: true,
    },
    termsAndConditions: {
      type: Boolean,
      enum: [true],
      required: true,
    },
    selectedInstallments: {
      type: [String],
      enum: [1, 2, 3, 4, 5, 6],
      default: "1",
      required: true,
    },
  },
  { versionKey: false, timestamps: true }
);

module.exports = mongoose.model(
  "Training",
  trainingSchema,
  config.dbPrefix + "GNINIART"
);
