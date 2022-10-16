const mongoose = require("mongoose");

const mpesaSchema = new mongoose.Schema({
  stkCallback: {
    type: Object,
    required: false,
  },

  Date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("mpesa", mpesaSchema);
