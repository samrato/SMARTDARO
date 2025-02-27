const mongoose = require("mongoose");

const CourseSchema = new mongoose.Schema({
    name: { type: String, required: true },
    code: { type: String, unique: true, required: true }, // e.g., "CS101"
    instructor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // List of student IDs
    creditHours: { type: Number, required: true },
});

module.exports = mongoose.model("Course", CourseSchema);
