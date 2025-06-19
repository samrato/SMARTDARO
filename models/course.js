const mongoose = require("mongoose");

const CourseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, unique: true, required: true }, // e.g., "CS101"
  lecturer: { type: mongoose.Schema.Types.ObjectId, ref: "Lecturer", required: true },
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Optional
  creditHours: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model("Course", CourseSchema);
