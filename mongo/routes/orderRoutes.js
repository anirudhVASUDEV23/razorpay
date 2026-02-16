const express = require("express");
const razorpay = require("../../utils/razorpay");
const auth = require("../../middleware/authMiddleware");
const Product = require("../models/Product");
const Order = require("../models/Order");

const router = express.Router();

router.post("/create", auth, async (req, res) => {
  const product = await Product.findById(req.body.productId);

  const rOrder = await razorpay.orders.create({
    amount: product.price,
    currency: product.currency,
  });

  await Order.create({
    userId: req.user.userId,
    productId: product._id,
    amount: product.price,
    currency: product.currency,
    razorpay_order_id: rOrder.id,
  });

  res.json(rOrder);
});

module.exports = router;
