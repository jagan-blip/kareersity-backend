const mongoose = require("mongoose");
const config = require("../nodedetails/config");

const userSchema = new mongoose.Schema(
  {
    profilePic: {
      type: String,
      default: "",
    },
    traineeId: {
      type: String,
      default: "",
    },
    userType: {
      type: String,
      enum: ["student", "workingProfessional", "doctor", "corporate"],
    },
    corporate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Corporate",
    },
    fullName: {
      type: String,
      default: "",
    },
    email: {
      type: String,
      default: "",
    },
    phoneNumber: {
      type: String,
      default: "",
    },
    password: {
      type: String,
      default: "",
    },
    reasonId: {
      type: String,
      default: "",
    },

    isNewUser: {
      type: Boolean,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isAccountVerified: {
      type: Boolean,
      default: false,
    },
    // to check user already registered before purchasing Direct training
    isExUser: {
      type: Boolean,
      default: null,
    },
    isEnrolledInDirectTraining: {
      type: Boolean,
      default: false,
    },
    favorite: [
      {
        type: mongoose.Schema.Types.ObjectId,
        default: "",
        comments: "favorite course id",
      },
    ],
    profilePerCompleted: {
      type: Number,
      default: 0,
    },
  },
  { versionKey: false, timestamps: true }
);

module.exports = mongoose.model("User", userSchema, config.dbPrefix + "RESU");
