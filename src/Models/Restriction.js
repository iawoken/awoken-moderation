const mongoose = require("mongoose");

const Ceza = mongoose.Schema({
  CezaID: String,
  userID: String,
  Type: String,
  Author: String,
  Reason: String,
  DateNow: Number,
  Activity: { type: Boolean, default: true },
  Temporary: { type: Boolean, default: false },
  FinishDate: Number
});

module.exports = mongoose.model("CezaInformation", Ceza);