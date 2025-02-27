const Course = require("../models/course");

// Retrieve all courses
const getAllCourses = async () => {
    try {
        return await Course.find().populate("instructor students");
    } catch (error) {
        throw new Error("Error retrieving courses: " + error.message);
    }
};

// Retrieve a course by ID
const getCourseById = async (id) => {
    try {
        const course = await Course.findById(id).populate("instructor students");
        if (!course) throw new Error("Course not found");
        return course;
    } catch (error) {
        throw new Error(error.message);
    }
};

// Add a new course
const createCourse = async ({ name, code, instructorId, capacity, duration }) => {
    try {
        const existingCourse = await Course.findOne({ code });
        if (existingCourse) throw new Error("Course code already exists");

        const course = new Course({ name, code, instructor: instructorId, capacity, duration });
        await course.save();
        return course;
    } catch (error) {
        throw new Error(error.message);
    }
};

// Update a course
const updateCourse = async (id, updatedData) => {
    try {
        const course = await Course.findByIdAndUpdate(id, updatedData, { new: true });
        if (!course) throw new Error("Course not found");
        return course;
    } catch (error) {
        throw new Error(error.message);
    }
};

// Delete a course
const deleteCourse = async (id) => {
    try {
        const course = await Course.findByIdAndDelete(id);
        if (!course) throw new Error("Course not found");
        return { message: "Course deleted successfully" };
    } catch (error) {
        throw new Error(error.message);
    }
};

// Export all functions 
module.exports = {
    getAllCourses,
    getCourseById,
    createCourse,
    updateCourse,
    deleteCourse
};
