const mongoose = require("mongoose");

const phoneSchema = new mongoose.Schema({
  phoneNumbers: {
    type: String,
    required: true,
    min: 7,
  },
  amount: {
    type: String,
    required: true,
    min: 0,
  },

  Date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("phone", phoneSchema);
