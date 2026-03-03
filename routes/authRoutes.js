const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const admin = require("../firebaseAdmin");

// Firebase Login Route
router.post("/firebase-login", async (req, res) => {
  console.log("Incoming body:", req.body);
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: "No token provided" });
    }

    // Verify Firebase token
    const decoded = await admin.auth().verifyIdToken(token);

    const email = decoded.email;
    const name = decoded.name || decoded.displayName || "User";

    // Check DB
    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name,
        email,
        password: "firebase_user", // dummy
      });
    }

    // Create JWT
    const jwtToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login success",
      token: jwtToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });

  } catch (err) {
    console.error(err);
    res.status(401).json({ message: "Invalid Firebase token" });
  }
});

// Dashboard Profile Route
router.get("/profile", async (req, res) => {
  res.json({ message: "profile route working" });
});

module.exports = router;