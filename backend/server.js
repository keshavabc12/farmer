require("dotenv").config();
const express  = require("express");
const mongoose = require("mongoose");
const cors     = require("cors");

const farmerRoutes = require("./routes/farmers");
const authRoutes   = require("./routes/auth");
const seedAdmin    = require("./seed");

const app  = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ──────────────────────────────────────────────
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Routes ──────────────────────────────────────────────────
app.use("/api/auth",    authRoutes);
app.use("/api/farmers", farmerRoutes);

app.get("/", (req, res) => {
  res.json({ message: "🌿 Mitti Mitra API is running", version: "1.0.0" });
});

// ── MongoDB Connection ──────────────────────────────────────
mongoose
  .connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
  })
  .then(async () => {
    console.log("✅ Connected to MongoDB Atlas");
    await seedAdmin();          // 🌱 auto-seed dummy admin user
    app.listen(PORT, () => {
      console.log(`🌿 Mitti Mitra server running on http://localhost:${PORT}`);
      console.log(`📧 Login: admin@mitti.com  🔑 Password: mitti@123`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  });

// ── Error Handler ───────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal server error" });
});
