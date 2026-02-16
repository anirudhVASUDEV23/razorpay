const express = require("express");
const crypto = require("crypto");
const Order = require("../models/Order");
const WebhookEvent = require("../models/WebhookEvent");

const router = express.Router();

router.post(
  "/razorpay",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const signature = req.headers["x-razorpay-signature"];

    const expected = crypto
      .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(req.body)
      .digest("hex");

    if (expected !== signature)
      return res.status(400).send("Invalid signature");

    const event = JSON.parse(req.body);

    if (await WebhookEvent.findOne({ event_id: event.id }))
      return res.json({ status: "Already processed" });

    await WebhookEvent.create({
      event_id: event.id,
      event_type: event.event,
      payload: event,
    });

    const orderId =
      event.payload.payment?.entity?.order_id ||
      event.payload.refund?.entity?.order_id;

    if (event.event === "payment.captured")
      await Order.updateOne({ razorpay_order_id: orderId }, { status: "paid" });

    if (event.event === "payment.failed")
      await Order.updateOne(
        { razorpay_order_id: orderId },
        { status: "failed" },
      );

    if (event.event === "refund.processed")
      await Order.updateOne(
        { razorpay_order_id: orderId },
        { status: "refunded" },
      );

    res.json({ status: "ok" });
  },
);

module.exports = router;
