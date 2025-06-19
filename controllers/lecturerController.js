const Lecturer = require("../models/Lecturer");
const HttpError = require("../models/errorModel");

// ========== Add Lecturer ==========
const addLecturer = async (req, res) => {
  try {
    const { fullName, email, department, phone } = req.body;

    if (!fullName || !email || !department) {
      return res.status(422).json({ message: "All fields are required" });
    }

    const existing = await Lecturer.findOne({ email });
    if (existing) {
      return res.status(422).json({ message: "Lecturer with that email already exists" });
    }

    const lecturer = await Lecturer.create({ fullName, email, department, phone });
    res.status(201).json({ status: "success", lecturer });
  } catch (error) {
    console.error("Add Lecturer Error:", error);
    res.status(500).json({ message: "Failed to add lecturer" });
  }
};

// ========== Get All Lecturers ==========
const getAllLecturers = async (req, res) => {
  try {
    const lecturers = await Lecturer.find();
    res.json({ status: "success", lecturers });
  } catch (error) {
    console.error("Get All Lecturers Error:", error);
    res.status(500).json({ message: "Failed to fetch lecturers" });
  }
};

// ========== Get Lecturer by ID ==========
const getLecturerById = async (req, res) => {
  try {
    const lecturer = await Lecturer.findById(req.params.id);
    if (!lecturer) return res.status(404).json({ message: "Lecturer not found" });
    res.json({ status: "success", lecturer });
  } catch (error) {
    console.error("Get Lecturer By ID Error:", error);
    res.status(500).json({ message: "Failed to fetch lecturer" });
  }
};

// ========== Delete Lecturer ==========
const deleteLecturer = async (req, res) => {
  try {
    await Lecturer.findByIdAndDelete(req.params.id);
    res.json({ status: "success", message: "Lecturer deleted" });
  } catch (error) {
    console.error("Delete Lecturer Error:", error);
    res.status(500).json({ message: "Failed to delete lecturer" });
  }
};

module.exports = {
  addLecturer,
  getAllLecturers,
  getLecturerById,
  deleteLecturer,
};
