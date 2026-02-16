const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

router.post("/register", async (req, res) => {
  const userExists = await User.findOne({ email: req.body.email });
  if (userExists)
    return res.status(400).json({ error: "Email already exists" });
  if (req.body.password.length < 6)
    return res
      .status(400)
      .json({ error: "Password must be at least 6 characters" });
  if (!req.body.name)
    return res.status(400).json({ error: "Name is required" });
  if (!req.body.email)
    return res.status(400).json({ error: "Email is required" });
  if (!req.body.password)
    return res.status(400).json({ error: "Password is required" });
  if (!req.body.email.includes("@"))
    return res.status(400).json({ error: "Invalid email" });
  const hashed = await bcrypt.hash(req.body.password, 10);
  const role = req.body.email === process.env.ADMIN_EMAIL ? "admin" : "user";
  const user = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: hashed,
    role,
  });
  res.json(user);
});

router.post("/login", async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(400).json({ error: "Invalid credentials" });

  const valid = await bcrypt.compare(req.body.password, user.password);
  if (!valid) return res.status(400).json({ error: "Invalid credentials" });

  const token = jwt.sign(
    { userId: user._id, role: user.role },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    },
  );

  res.json({ token });
});

module.exports = router;
