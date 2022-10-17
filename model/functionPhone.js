const mongoose = require("mongoose");

const functionSchema = new mongoose.Schema({
  _id: {
    type: Object,
    required: false,
    min: 7,
  },
  phoneNumber: {
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

module.exports = mongoose.model("functionPhone", functionSchema);
