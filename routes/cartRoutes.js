// routes/cartRoutes.js
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Cart = require("../models/Cart");

// Get user cart
router.get("/", auth, async (req, res) => {
  const cart = await Cart.findOne({ user: req.user.id }).populate("items.product");
  res.json(cart || { items: [] });
});

// Add/update product quantity
router.post("/add", auth, async (req, res) => {
  const { productId, quantity } = req.body;
  let cart = await Cart.findOne({ user: req.user.id });

  if (!cart) {
    cart = new Cart({ user: req.user.id, items: [] });
  }

  const index = cart.items.findIndex(item => item.product.toString() === productId);

  if (index > -1) {
    cart.items[index].quantity += quantity;
    if (cart.items[index].quantity <= 0) cart.items.splice(index, 1);
  } else if (quantity > 0) {
    cart.items.push({ product: productId, quantity });
  }

  await cart.save();
  await cart.populate("items.product");
  res.json(cart);
});

// Remove product
router.post("/remove", auth, async (req, res) => {
  const { productId } = req.body;
  const cart = await Cart.findOne({ user: req.user.id });

  if (!cart) return res.status(400).json({ message: "Cart not found" });

  cart.items = cart.items.filter(item => item.product.toString() !== productId);
  await cart.save();
  await cart.populate("items.product");
  res.json(cart);
});

module.exports = router;