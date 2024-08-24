const mongoose = require("mongoose");
const config = require("../nodedetails/config");

const mainCourseSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      default: "",
    },
    thumbnail: {
      type: String,
      default: "",
    },
    title: {
      type: String,
      default: "",
    },
    shortDescription: {
      type: String,
      default: "",
    },
    duration: {
      type: String,
      default: "",
    },
    level: {
      type: String,
      default: "",
    },
    freeForEveryone: {
      type: Boolean,
      default: false,
    },
    freeForEnInLast30Days: {
      type: Boolean,
      default: false,
    },
    expiry: {
      type: Date,
      default: null,
    },
    freeForbasedOnColleges: {
      type: Boolean,
      default: false,
    },
    freeColleges: [
      {
        type: String,
        default: null,
      },
    ],
    price: {
      type: Number,
      default: 0,
    },
    regularPrice: {
      type: Number,
      default: 0,
    },
    discountedPrice: {
      type: Number,
      default: 0,
    },
    discountedPriceExpiry: {
      type: Number,
      default: 0,
    },

    description: {
      type: String,
      default: "",
    },
    whatWillYouLearn: {
      type: String,
      default: "",
    },
    certifications: {
      type: String,
      default: "",
    },
    whoThisCourseIsFor: {
      type: String,
      default: "",
    },
    courseIncludes: [
      {
        type: String,
        default: null,
      },
    ],
    educators: {
      type: String,
      required: true,
    },
    previewVideo: {
      type: String,
      default: "",
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    corporate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Corporate",
    },
    isForCorporate: {
      type: Boolean,
      default: false,
    },

    forUsersOfType: {
      type: [
        {
          type: String,
          enum: ["student", "working", "doctor"],
        },
      ],
    },
  },
  { versionKey: false, timestamps: true }
);
module.exports = mongoose.model(
  "MainCourse",
  mainCourseSchema,
  config.dbPrefix + "ESRUOCNIAM"
);
