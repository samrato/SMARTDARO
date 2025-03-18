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
        if (!req.user || req.user.role !== "admin") {
            return res.status(403).json({message:"Unauthorize :Admins only"})
        }

        const { name, code, instructorId, capacity, duration } = req.body;
        if (!name || !code || !instructorId || !capacity || !duration) {
            return res.status(422).json({message:"All fields are required"})
            
        }

        const newCourse = await courseService.createCourse({ name, code, instructorId, capacity, duration });
        res.status(201).json({ status: "success", course: newCourse });
    } catch (error) {
        console.error(error)
        return res.status(500).json({message:"failed to fetch courses"})
    }
};

// Update course (Admin only)
const updateCourseController = async (req, res, next) => {
    try {
        if (!req.user || req.user.role !== "admin") {
            return next(new HttpError("Unauthorized: Admins only", 403));
        }

        const updatedCourse = await courseService.updateCourse(req.params.courseId, req.body);
        res.json({ status: "success", course: updatedCourse });
    } catch (error) {
        next(new HttpError(error.message, 500));
    }
};

// Delete course (Admin only)
const deleteCourseController = async (req, res, next) => {
    try {
        if (!req.user || req.user.role !== "admin") {
            return next(new HttpError("Unauthorized: Admins only", 403));
        }

        await courseService.deleteCourse(req.params.courseId);
        res.json({ status: "success", message: "Course deleted successfully" });
    } catch (error) {
        next(new HttpError(error.message, 500));
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
