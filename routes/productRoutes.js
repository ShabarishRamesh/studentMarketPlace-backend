const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Product = require("../models/Product");
const upload = require("../middleware/upload");

// ADD PRODUCT
router.post("/", auth, upload.single("image"), async (req, res) => {
  try {

    if (!req.file) {
      return res.status(400).json({ message: "Image upload failed" });
    }

    const product = new Product({
      title: req.body.title,
      description: req.body.description,
      price: Number(req.body.price),
      image: req.file.path, 
      category: req.body.category,
      seller: req.user.id,
    });

    await product.save();

    res.json(product);

  } catch (err) {
    console.error("UPLOAD ERROR:", err);
    res.status(500).json({ message: "Error uploading product" });
  }
});

// GET ALL PRODUCTS
router.get("/", async (req, res) => {
  const products = await Product.find().populate("seller", "name");
  res.json(products);
});


// NEW ENDPOINT for search & filters
router.get("/search", async (req, res) => {
  try {
    const { search, minPrice, maxPrice, category } = req.query;

    const filter = {};

    // Partial text match on title or description
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // Price filter
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    // Category filter
    if (category) filter.category = category;

    const products = await Product.find(filter).sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    console.error("SEARCH PRODUCTS ERROR:", err);
    res.status(500).json({ message: "Failed to fetch products" });
  }
});


module.exports = router;