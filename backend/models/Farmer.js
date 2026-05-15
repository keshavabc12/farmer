const mongoose = require("mongoose");

const farmerSchema = new mongoose.Schema({
  // ── Enumerator / Meta ──────────────────────────────────────
  enumeratorName: { type: String },
  surveyDate:     { type: Date, default: Date.now },

  // ── SECTION A: Farmer Profile ──────────────────────────────
  farmerName: { type: String, required: true, trim: true },
  taluk:      { type: String, enum: ["Tumkur Rural", "Gubbi"], required: true },
  village:    { type: String, required: true, trim: true },
  district:   { type: String, default: "Tumkur" },
  photo:      { type: String },           // base64 or filename

  gender:    { type: String, enum: ["Male", "Female", "Other"] },
  ageGroup:  { type: String, enum: ["Below 25", "25-35", "36-45", "46-55", "Above 55"] },
  education: { type: String, enum: ["No formal education", "Primary school", "High school", "PU/Diploma", "Graduate and above"] },
  landSize:  { type: String, enum: ["Less than 2 acres", "2-5 acres", "6-10 acres", "More than 10 acres"] },
  mainCrop:  { type: String, enum: ["Paddy", "Ragi", "Maize", "Coconut", "Areca", "Vegetables", "Pulses", "Others"] },
  farmingExp:{ type: String, enum: ["Less than 5 years", "5-10 years", "11-20 years", "More than 20 years"] },

  // ── SECTION B: Awareness (Likert 1–5) ─────────────────────
  b8_awareServices:      { type: Number, min: 1, max: 5 },
  b9_understandsBenefit: { type: Number, min: 1, max: 5 },
  b10_knowsExcessDamage: { type: Number, min: 1, max: 5 },
  b11_knowsHowToTest:    { type: Number, min: 1, max: 5 },
  b12_reducesFertilizer: { type: Number, min: 1, max: 5 },
  b13_infoAvailable:     { type: Number, min: 1, max: 5 },

  // ── SECTION C: Accessibility (Likert 1–5) ─────────────────
  c14_easyAccess:       { type: Number, min: 1, max: 5 },
  c15_convenientProcess:{ type: Number, min: 1, max: 5 },
  c16_reasonableTime:   { type: Number, min: 1, max: 5 },
  c17_affordable:       { type: Number, min: 1, max: 5 },
  c19_lacksDiscourages: { type: Number, min: 1, max: 5 },

  // ── SECTION D: Adoption & Practices ───────────────────────
  d20_everTested:   { type: String, enum: ["Yes", "No"] },
  d21_frequency:    { type: String, enum: ["Every crop season", "Once a year", "Occasionally", "Rarely", "N/A"] },
  d22_reasonNoTest: { type: String },
  d23_fertDecision: { type: String },
  d24_excessYield:  { type: String, enum: ["Yes", "No", "Not sure"] },
  d25_mainFactor:   { type: String },

  // ── SECTION E: Dichotomous Yes/No ─────────────────────────
  e26_testingImportant:   { type: String, enum: ["Yes", "No"] },
  e27_receivedTraining:   { type: String, enum: ["Yes", "No"] },
  e28_facilitiesAvailable:{ type: String, enum: ["Yes", "No"] },

  // ── Survey Status ──────────────────────────────────────────
  status: { type: String, enum: ["Complete", "Pending", "Draft"], default: "Draft" },

}, { timestamps: true });

module.exports = mongoose.model("Farmer", farmerSchema);
