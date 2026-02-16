const express = require("express");
const Product = require("../models/Product");

const router = express.Router();

router.get("/", async (req, res) => {
  res.json(await Product.find());
});

module.exports = router;
