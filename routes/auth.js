const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

/* ============================
   SIGN UP
   POST /api/auth/signup
============================ */
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, country, city, bio } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "All required fields must be filled" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      country,
      city,
      bio
    });

    await user.save();

    res.json({ message: "User registered successfully" });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/* ============================
   LOGIN
   POST /api/auth/login
============================ */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        name: user.name
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        country: user.country,
        city: user.city,
        bio: user.bio
      }
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/* ============================
   UPDATE PROFILE
   PUT /api/auth/profile
   (JWT PROTECTED)
============================ */
router.put("/profile", authMiddleware, async (req, res) => {
  try {
    const { name, country, city, bio } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, country, city, bio },
      { new: true }
    );

    res.json({
      message: "Profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        country: user.country,
        city: user.city,
        bio: user.bio
      }
    });
  } catch (err) {
    console.error("Profile update error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
