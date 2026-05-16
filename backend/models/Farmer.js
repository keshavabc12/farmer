const mongoose = require("mongoose");

const farmerSchema = new mongoose.Schema({
  // ── Enumerator / Meta ──────────────────────────────────────
  enumeratorName: { type: String },
  surveyDate:     { type: Date, default: Date.now },

  // ── SECTION A: Farmer Profile ──────────────────────────────
  farmerName: { type: String, required: true, trim: true },
  taluk:      { type: String, required: true },
  village:    { type: String, required: true, trim: true },
  district:   { type: String, default: "Tumkur" },
  photo:      { type: String },           // base64 resized

  q1_gender:    { type: String, enum: ["Male", "Female", "Other"] },
  q2_ageGroup:  { type: String, enum: ["Below 25 years", "25–35 years", "36–45 years", "46–55 years", "Above 55 years"] },
  q3_education: { type: String, enum: ["No formal education", "Primary school", "High school", "PU/Diploma", "Graduate and above"] },
  q4_landSize:  { type: String, enum: ["Less than 2 acres", "2–5 acres", "6–10 acres", "More than 10 acres"] },
  q5_mainCrop:  { type: String }, // Paddy / Ragi / Maize / Coconut / Areca / Vegetables / Pulses / Others
  q6_farmingExp:{ type: String, enum: ["Less than 5 years", "5–10 years", "11–20 years", "More than 20 years"] },

  // ── SECTION B: Awareness (Likert 1–5) ─────────────────────
  q7_awareServices:      { type: Number, min: 1, max: 5 },
  q8_understandsBenefit: { type: Number, min: 1, max: 5 },
  q9_knowsExcessDamage: { type: Number, min: 1, max: 5 },
  q10_knowsHowToTest:    { type: Number, min: 1, max: 5 },
  q11_reducesFertilizer: { type: Number, min: 1, max: 5 },
  q12_infoAvailable:     { type: Number, min: 1, max: 5 },

  // ── SECTION C: Accessibility ──────────────────────────────
  q13_easyAccess:       { type: Number, min: 1, max: 5 },
  q14_convenientProcess:{ type: Number, min: 1, max: 5 },
  q15_reasonableTime:   { type: Number, min: 1, max: 5 },
  q16_affordable:       { type: Number, min: 1, max: 5 },
  q17_lacksDiscourages: { type: Number, min: 1, max: 5 },
  q18_facilitiesAvailable:{ type: String, enum: ["Yes", "No"] },

  // ── SECTION D: Adoption ───────────────────────────────────
  q19_everTested:   { type: String, enum: ["Yes", "No"] },
  q20_frequency:    { type: String }, // Every crop season / Once a year / Occasionally / Rarely
  q21_reasonNoTest: { type: String }, // Lack of awareness / No nearby testing center / ...
  q22_receivedTraining:   { type: String, enum: ["Yes", "No"] },
  q23_useMoreIfAccessible:{ type: String, enum: ["Yes", "No"] },

  // ── SECTION E: Fertilizer Usage ───────────────────────────
  q24_fertDecision: { type: String }, // Based on experience / Advice from fertilizer shop / ...
  q25_excessYield:  { type: String, enum: ["Yes", "No", "Not sure"] },
  q26_mainFactor:   { type: String }, // Soil condition / Water availability / ...

  // ── SECTION F: Perception ─────────────────────────────────
  q27_testingImportant:   { type: String, enum: ["Yes", "No"] },
  q28_villageLevel:      { type: Number, min: 1, max: 5 },
  q29_resultsQuickly:    { type: Number, min: 1, max: 5 },
  q30_awarenessPrograms: { type: Number, min: 1, max: 5 },

  // ── Survey Status ──────────────────────────────────────────
  status: { type: String, enum: ["Complete", "Pending", "Draft"], default: "Draft" },

}, { timestamps: true });

module.exports = mongoose.model("Farmer", farmerSchema);
