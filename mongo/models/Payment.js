const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    razorpay_payment_id: { type: String, unique: true },
    razorpay_order_id: String,
    razorpay_signature: String,
    status: { type: String, enum: ["captured", "failed"] },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Payment", schema);
