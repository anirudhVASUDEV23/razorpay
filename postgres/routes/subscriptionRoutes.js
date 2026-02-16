const express = require("express");
const prisma = require("../../config/prisma");
const razorpay = require("../../utils/razorpay");
const auth = require("../../middleware/authMiddleware");

const router = express.Router();

router.post("/coffee/create", auth, async (req, res) => {
  const subscription = await razorpay.subscriptions.create({
    plan_id: process.env.COFFEE_PLAN_ID,
    customer_notify: 1,
    total_count: 60,
  });

  await prisma.coffeeSubscription.create({
    data: {
      userId: req.user.userId,
      razorpaySubscriptionId: subscription.id,
      razorpayPlanId: process.env.COFFEE_PLAN_ID,
      status: subscription.status,
    },
  });

  res.json(subscription);
});

router.get("/coffee/my", auth, async (req, res) => {
  const sub = await prisma.coffeeSubscription.findFirst({
    where: { userId: req.user.userId },
  });

  res.json(sub);
});

router.post("/coffee/cancel", auth, async (req, res) => {
  const subscription = await prisma.coffeeSubscription.findFirst({
    where: {
      userId: req.user.userId,
    },
  });

  if (!subscription)
    return res.status(404).json({ error: "No subscription found" });

  await razorpay.subscriptions.cancel(subscription.razorpaySubscriptionId, {
    cancel_at_cycle_end: true,
  });

  res.json({ message: "Cancellation initiated" });
});

module.exports = router;
