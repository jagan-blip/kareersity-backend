const mongoose = require("mongoose");
const config = require("../nodedetails/config");
// main banner 30000+ phrmaceutical companies....
const BannerSchema = new mongoose.Schema(
  {
    thumbnail: {
      type: String,
      default: "",
    },
    bannerFor: {
      //display list of type
      type: String,
      default: "",
    },
    videoUrl: {
      type: String,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    corporate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Corporate",
    },
  },
  { versionKey: false, timestamps: true }
);

module.exports = mongoose.model(
  "Banner",
  BannerSchema,
  config.dbPrefix + "RENNAB"
);
