const express = require("express");
const router = express.Router();
const Farmer = require("../models/Farmer");

// GET /api/farmers - Get all farmers with optional filters
router.get("/", async (req, res) => {
  try {
    const { status, cropType, village, taluk, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (cropType) filter.mainCrop = cropType;
    if (village) filter.village = new RegExp(village, "i");
    if (taluk) filter.taluk = taluk;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [farmers, total] = await Promise.all([
      Farmer.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      Farmer.countDocuments(filter),
    ]);

    res.json({ farmers, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/farmers/stats - Dashboard statistics
router.get("/stats", async (req, res) => {
  try {
    const [total, completed, pending, draft] = await Promise.all([
      Farmer.countDocuments(),
      Farmer.countDocuments({ status: "Complete" }),
      Farmer.countDocuments({ status: "Pending" }),
      Farmer.countDocuments({ status: "Draft" }),
    ]);

    const villages = await Farmer.distinct("village");
    const districts = await Farmer.distinct("district");

    // Awareness metrics (derived from Section B, D, E)
    const aware = await Farmer.countDocuments({ b8_awareServices: { $gte: 4 } });
    const tested = await Farmer.countDocuments({ d20_everTested: "Yes" });
    const usesReports = await Farmer.countDocuments({ d23_fertDecision: "Based on soil test report" });
    const noBarriers = await Farmer.countDocuments({ e28_facilitiesAvailable: "Yes" });

    // Recent 5 responses
    const recentFarmers = await Farmer.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("farmerName village mainCrop status createdAt");

    // Crop breakdown
    const cropStats = await Farmer.aggregate([
      { $group: { _id: "$mainCrop", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    res.json({
      totals: { total, completed, pending, draft },
      villages: villages.length,
      districts: districts.length,
      awareness: {
        awareOfSoilTesting: total > 0 ? Math.round((aware / total) * 100) : 0,
        hasTested: total > 0 ? Math.round((tested / total) * 100) : 0,
        usesReports: total > 0 ? Math.round((usesReports / total) * 100) : 0,
        noBarriers: total > 0 ? Math.round((noBarriers / total) * 100) : 0,
      },
      recentFarmers,
      cropStats,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/farmers/:id - Get single farmer
router.get("/:id", async (req, res) => {
  try {
    const farmer = await Farmer.findById(req.params.id);
    if (!farmer) return res.status(404).json({ error: "Farmer not found" });
    res.json(farmer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/farmers - Create new farmer survey
router.post("/", async (req, res) => {
  try {
    const farmer = new Farmer(req.body);
    const saved = await farmer.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/farmers/:id - Update farmer survey
router.put("/:id", async (req, res) => {
  try {
    const farmer = await Farmer.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!farmer) return res.status(404).json({ error: "Farmer not found" });
    res.json(farmer);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/farmers/:id - Delete farmer record
router.delete("/:id", async (req, res) => {
  try {
    const farmer = await Farmer.findByIdAndDelete(req.params.id);
    if (!farmer) return res.status(404).json({ error: "Farmer not found" });
    res.json({ message: "Farmer record deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
