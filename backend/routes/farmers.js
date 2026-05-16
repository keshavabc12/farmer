const express = require("express");
const router = express.Router();
const Farmer = require("../models/Farmer");

// GET /api/farmers - Get all farmers with optional filters
router.get("/", async (req, res) => {
  try {
    const { status, cropType, village, taluk, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (cropType && cropType !== 'All Crops') filter.q5_mainCrop = cropType;
    if (village) filter.village = new RegExp(village, "i");
    if (taluk && taluk !== 'All Taluks') filter.taluk = taluk;

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

// GET /api/farmers/stats - Dashboard statistics (Comprehensive for SOILSENSE)
router.get("/stats", async (req, res) => {
  try {
    const total = await Farmer.countDocuments();
    if (total === 0) {
      return res.json({ totals: { total: 0 }, questions: {}, awareness: {}, recentFarmers: [] });
    }

    const totals = await Farmer.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);
    
    const statusCounts = { total, Complete: 0, Pending: 0, Draft: 0 };
    totals.forEach(t => { if (t._id) statusCounts[t._id] = t.count; });

    // High level metrics for Dashboard
    const aware = await Farmer.countDocuments({ q7_awareServices: { $gte: 4 } });
    const tested = await Farmer.countDocuments({ q19_everTested: "Yes" });
    const usesReports = await Farmer.countDocuments({ q24_fertDecision: "Based on soil test report" });
    const noBarriers = await Farmer.countDocuments({ q18_facilitiesAvailable: "Yes" });

    // Individual question breakdown
    const fields = [
      'q1_gender', 'q2_ageGroup', 'q3_education', 'q4_landSize', 'q5_mainCrop', 'q6_farmingExp',
      'q7_awareServices', 'q8_understandsBenefit', 'q9_knowsExcessDamage', 'q10_knowsHowToTest', 'q11_reducesFertilizer', 'q12_infoAvailable',
      'q13_easyAccess', 'q14_convenientProcess', 'q15_reasonableTime', 'q16_affordable', 'q17_lacksDiscourages', 'q18_facilitiesAvailable',
      'q19_everTested', 'q20_frequency', 'q21_reasonNoTest', 'q22_receivedTraining', 'q23_useMoreIfAccessible',
      'q24_fertDecision', 'q25_excessYield', 'q26_mainFactor',
      'q27_testingImportant', 'q28_villageLevel', 'q29_resultsQuickly', 'q30_awarenessPrograms'
    ];

    const questionStats = {};
    const aggPromises = fields.map(field => 
      Farmer.aggregate([
        { $match: { [field]: { $exists: true, $ne: null } } },
        { $group: { _id: `$${field}`, count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]).then(results => {
        questionStats[field] = results;
      })
    );

    await Promise.all(aggPromises);

    res.json({
      totals: statusCounts,
      questions: questionStats,
      awareness: {
        awareOfSoilTesting: Math.round((aware / total) * 100),
        hasTested: Math.round((tested / total) * 100),
        usesReports: Math.round((usesReports / total) * 100),
        noBarriers: Math.round((noBarriers / total) * 100),
      },
      recentFarmers: await Farmer.find().sort({ createdAt: -1 }).limit(5).select("farmerName village q5_mainCrop status createdAt")
    });
  } catch (err) {
    console.error(err);
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
