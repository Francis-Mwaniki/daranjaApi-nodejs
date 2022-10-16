const mongoose = require("mongoose");

const phoneSchema = new mongoose.Schema({
  phoneNumbers: {
    type: String,
    required: true,
  },

  Date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("phone", phoneSchema);
