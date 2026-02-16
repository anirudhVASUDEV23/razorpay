const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    event_id: { type: String, unique: true },
    event_type: String,
    payload: Object,
  },
  { timestamps: true },
);

module.exports = mongoose.model("WebhookEvent", schema);
