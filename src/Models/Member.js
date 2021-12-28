const mongoose = require("mongoose");

const member = mongoose.Schema({
  SunucuID: String,
  userID: String,
  AFK: Object,
  History: Array,
  Authorized: { Man: { type: Number, default: 0 }, Woman: { type: Number, default: 0 }},
  RestNumber: { BanNumber: { type: Number, default: 0 }, JailNumber: { type: Number, default: 0 }, VMuteNumber: { type: Number, default: 0 }, MuteNumber: { type: Number, default: 0 } },
  CezaPuan: { type: Number, default: 0 },
  Uyarılar: Array,
  Nots: Array
});

module.exports = mongoose.model("members", member);