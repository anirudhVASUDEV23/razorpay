const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    name: String,
    description: String,
    price: Number,
    currency: { type: String, default: "INR" },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Product", schema);
