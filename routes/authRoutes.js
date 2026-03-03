const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const admin = require("../firebaseAdmin"); // Firebase Admin SDK

// =======================
// Email/Password Signup
// =======================
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user in MongoDB
    const user = await User.create({
      name,
      email,
      password: hashedPassword
    });

    // Issue backend JWT
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.status(201).json({
      message: "Signup successful",
      token,
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// =======================
// Email/Password Login
// =======================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    // Issue backend JWT
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.json({
      message: "Login successful",
      token,
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// =======================
// Firebase Login
// =======================
router.post("/firebase-login", async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ message: "No token provided" });

    // Verify Firebase token
    const decoded = await admin.auth().verifyIdToken(token);

    const email = decoded.email;
    const name = decoded.name || decoded.displayName || "User";

    // Check if user exists in MongoDB
    let user = await User.findOne({ email });
    if (!user) {
      // Create a dummy password for Firebase users
      const hashedPassword = await bcrypt.hash("firebase_user", 10);
      user = await User.create({
        name,
        email,
        password: hashedPassword
      });
    }

    // Issue backend JWT
    const jwtToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.json({
      message: "Firebase login successful",
      token: jwtToken,
      user: { id: user._id, name: user.name, email: user.email }
    });

  } catch (err) {
    console.error(err);
    res.status(401).json({ message: "Invalid Firebase token" });
  }
});

// =======================
// Protected Profile Route
// =======================
const authMiddleware = require("../middleware/auth");

router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;