const User = require("./models/User");

const SEED_USER = {
  name:     "Admin User",
  email:    "admin@mitti.com",
  password: "mitti@123",
  role:     "admin",
};

async function seedAdmin() {
  try {
    const exists = await User.findOne({ email: SEED_USER.email });
    if (!exists) {
      await User.create(SEED_USER);
      console.log("🌱 Seed user created → admin@mitti.com / mitti@123");
    } else {
      console.log("✅ Seed user already exists → admin@mitti.com");
    }
  } catch (err) {
    console.error("❌ Seeding failed:", err.message);
  }
}

module.exports = seedAdmin;
