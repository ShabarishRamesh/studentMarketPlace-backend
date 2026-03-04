require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const cartRoutes = require("./routes/cartRoutes");

const app = express();
<<<<<<< HEAD
const PORT = process.env.PORT
=======
const PORT = process.env.PORT || 3500;
>>>>>>> 9985af06ec595854f755ca04f5757e86ff6ea36a

app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(express.json());

// ROUTES
app.use("/api/auth", authRoutes);
app.use("/api/addproduct", productRoutes);
app.use("/api/cart", cartRoutes);

// TEST
app.get("/", (req, res) => res.send("Backend running"));

// MONGO
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));