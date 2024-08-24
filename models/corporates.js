const mongoose = require("mongoose");

const Schema = new mongoose.Schema({
  corporateName: {
    type: String,
    required: true,
  },

  corporateCode: {
    type: String,
    required: true,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model("Corporate", Schema);
