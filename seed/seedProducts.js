require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("../models/Product");
const connectDB = require("../config/db");

const seedProducts = async () => {
  await connectDB();

  await Product.deleteMany();

  await Product.insertMany([
    {
      name: "Premium Course",
      description: "Full stack mastery course",
      price: 49900, // ₹499
    },
    {
      name: "Pro Membership",
      description: "1 Year subscription",
      price: 99900, // ₹999
    },
    {
      name: "E-book",
      description: "Backend engineering guide",
      price: 19900, // ₹199
    },
  ]);

  console.log("Products Seeded");
  process.exit();
};

seedProducts();
