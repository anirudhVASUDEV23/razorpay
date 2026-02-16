const express = require("express");
const crypto = require("crypto");
const auth = require("../../middleware/authMiddleware");
const Order = require("../models/Order");
const Payment = require("../models/Payment");
const adminAuth = require("../../middleware/adminAuthMiddleware");

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

router.post("/refund", auth, adminAuth, async (req, res) => {
  try {
    const { paymentId, amount } = req.body;

    if (!paymentId) {
      return res.status(400).json({ error: "paymentId is required" });
    }

    // 1️⃣ Check payment exists in our DB
    const payment = await Payment.findOne({
      razorpay_payment_id: paymentId,
    });

    if (!payment) {
      return res.status(404).json({ error: "Payment not found" });
    }

    // 2️⃣ Ensure user owns this payment
    if (payment.userId.toString() !== req.user.userId) {
      return res.status(403).json({ error: "Not authorized" });
    }

    // 3️⃣ Initiate refund (do NOT update DB yet)
    const refund = await razorpay.payments.refund(paymentId, {
      amount, // optional (paise)
    });

    res.json({
      message: "Refund initiated",
      refund,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Refund failed" });
  }
});

module.exports = router;
