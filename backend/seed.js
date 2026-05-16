const User = require("./models/User");

const SEED_USER = {
  name:     "Admin User",
  email:    "admin@soilsense.com",
  password: "soilsense@123",
  role:     "admin",
};

async function seedAdmin() {
  try {
    const exists = await User.findOne({ email: SEED_USER.email });
    if (!exists) {
      await User.create(SEED_USER);
      console.log("🌱 Seed user created → admin@soilsense.com / soilsense@123");
    } else {
      console.log("✅ Seed user already exists → admin@soilsense.com");
    }
  } catch (err) {
    console.error("❌ Seeding failed:", err.message);
  }
}

module.exports = seedAdmin;
