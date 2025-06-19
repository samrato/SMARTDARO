const mongoose = require("mongoose");

const LecturerSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  department: { type: String, required: true },
  phone: { type: String },
  isAvailable: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model("Lecturer", LecturerSchema);
