const courseService = require("../service/courseService");
const HttpError = require("../models/errorModel");

// Get all courses (Public)
const getAllCoursesController = async (req, res, next) => {
    try {
        const courses = await courseService.getAllCourses();
        res.json({ status: "success", courses });
    } catch (error) {
        console.error(error)
        return res.status(500).json({message:"failed to fetch courses"})
        
    }
};

// Get course by ID (Public)
const getCourseByIdController = async (req, res, next) => {
    try {
        const course = await courseService.getCourseById(req.params.courseId);
        res.json({ status: "success", course });
    } catch (error) {
        return res.status(500).json({message:"failed to fetch courses"})
    }
};
// Add a new course (Admin only)
const addCourseController = async (req, res, next) => {
    try {
        const { name, code, lecturer, creditHours } = req.body;

        if (!name || !code || !lecturer || !creditHours) {
            return res.status(422).json({ message: "All fields are required" });
        }

        const newCourse = await courseService.createCourse({ name, code, lecturer, creditHours });
        res.status(201).json({ status: "success", course: newCourse });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Failed to create course" });
    }
};

// Update course (Admin only)
const updateCourseController = async (req, res, next) => {
    try {
        if (!req.user || req.user.role !== "admin") {
            return res.status(403).json({message:"Unauthorize :Admins only"})
        }

        const updatedCourse = await courseService.updateCourse(req.params.courseId, req.body);
        res.json({ status: "success", course: updatedCourse });
    } catch (error) {
        console.error(error)
        return res.status(500).json({message:"failed to fetch "})
    }
};

// Delete course (Admin only)
const deleteCourseController = async (req, res, next) => {
    try {
        if (!req.user || req.user.role !== "admin") {
            return res.status(403).json({message:"Unauthorize :Admins only"})
        }

        await courseService.deleteCourse(req.params.courseId);
        res.json({ status: "success", message: "Course deleted successfully" });
    } catch (error) {
        console.error(error)
        return res.status(500).json({message:"failed to fetch "})
    }
};

// Export the controllers using CommonJS
module.exports = {
    getAllCoursesController,
    getCourseByIdController,
    addCourseController,
    updateCourseController,
    deleteCourseController
};
