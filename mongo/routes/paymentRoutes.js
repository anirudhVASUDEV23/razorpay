const express = require("express");
const crypto = require("crypto");
const auth = require("../../middleware/authMiddleware");
const Order = require("../models/Order");
const Payment = require("../models/Payment");

const router = express.Router();

router.post("/verify", auth, async (req, res) => {
  const { order_id, payment_id, signature } = req.body;

  const existing = await Payment.findOne({ razorpay_payment_id: payment_id });
  if (existing) return res.json({ success: true });

  const generated = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(order_id + "|" + payment_id)
    .digest("hex");

  if (generated !== signature) return res.status(400).json({ success: false });

  const order = await Order.findOne({ razorpay_order_id: order_id });

  await Order.updateOne({ razorpay_order_id: order_id }, { status: "paid" });

  await Payment.create({
    userId: order.userId,
    razorpay_payment_id: payment_id,
    razorpay_order_id: order_id,
    razorpay_signature: signature,
    status: "captured",
  });

  res.json({ success: true });
});

router.get("/my", auth, async (req, res) => {
  res.json(await Payment.find({ userId: req.user.userId }));
});

module.exports = router;
