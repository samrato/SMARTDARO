const courseService = require("../service/courseService");
const HttpError = require("../models/errorModel");
const cache = require("../service/redisService");

// Get all courses (Public)
const getAllCoursesController = async (req, res, next) => {
    try {
        const cacheKey = "courses:all";
        const cached = await cache.getCache(cacheKey);
        if (cached) {
            return res.json({ status: "success", courses: cached, source: "cache" });
        }

        const courses = await courseService.getAllCourses();
        await cache.setCache(cacheKey, courses, 300); // 5 min TTL
        res.json({ status: "success", courses });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "failed to fetch courses" });
    }
};

// Get course by ID (Public)
const getCourseByIdController = async (req, res, next) => {
    try {
        const { courseId } = req.params;
        const cacheKey = `courses:id:${courseId}`;
        const cached = await cache.getCache(cacheKey);
        if (cached) {
            return res.json({ status: "success", course: cached, source: "cache" });
        }

        const course = await courseService.getCourseById(courseId);
        await cache.setCache(cacheKey, course, 300);
        res.json({ status: "success", course });
    } catch (error) {
        return res.status(500).json({ message: "failed to fetch courses" });
    }
};

// Add a new course (Admin only)
const addCourseController = async (req, res, next) => {
    try {
        const { name, code, instructorId, capacity, duration } = req.body;
        if (!name || !code || !instructorId || !capacity || !duration) {
            return res.status(422).json({ message: "All fields are required" });
        }

        const newCourse = await courseService.createCourse({ name, code, instructorId, capacity, duration });
        await cache.clearPattern("courses:*");
        res.status(201).json({ status: "success", course: newCourse });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "failed to fetch " });
    }
};

// Update course (Admin only)
const updateCourseController = async (req, res, next) => {
    try {
        const { courseId } = req.params;
        const updatedCourse = await courseService.updateCourse(courseId, req.body);
        await cache.clearPattern("courses:*");
        res.json({ status: "success", course: updatedCourse });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "failed to fetch " });
    }
};

// Delete course (Admin only)
const deleteCourseController = async (req, res, next) => {
    try {
        const { courseId } = req.params;
        await courseService.deleteCourse(courseId);
        await cache.clearPattern("courses:*");
        res.json({ status: "success", message: "Course deleted successfully" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "failed to fetch " });
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
