const mongoose = require("mongoose");
const config = require("../nodedetails/config");

const ownerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: "",
    },
    type: {
      type: String,
      default: "",
      // enum: ['super_admin', 'admin','educator']
    },
    email: {
      type: String,
      default: "",
    },
    password: {
      type: String,
      default: "",
    },
    status: {
      type: Number,
      default: 0,
    },
    isNewLogin: {
      type: Boolean,
      default: true,
    },
    roles: [
      {
        type: String,
        enum: ["superAdmin", "admin"],
      },
    ],
    roleId: {
      type: String,
      default: "",
    },
  },
  { versionKey: false, timestamps: true }
);

module.exports = mongoose.model(
  "Owner",
  ownerSchema,
  config.dbPrefix + "RENWOYTISREERAK"
);
