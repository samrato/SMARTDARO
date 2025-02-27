const HttpError = require('../models/errorModel');
const {
    allocateTimetableAI,
    getTimetableByDay,
    getTimetableById,
    deleteTimetable
} = require("../service/timetableService");

// Allocate AI-based timetable (Admin only)
const allocateTimetableAIController = async (req, res, next) => {
    try {
        if (!req.user || req.user.role !== 'admin') {
            return next(new HttpError("Unauthorized: Admins only", 403));
        }

        const { courseId, instructorId, students, preferredDay, preferredStartTime, preferredEndTime } = req.body;

        if (!courseId || !instructorId || !students || !preferredDay || !preferredStartTime || !preferredEndTime) {
            return next(new HttpError("All fields are required", 400));
        }

        const timetable = await allocateTimetableAI(courseId, instructorId, students, preferredDay, preferredStartTime, preferredEndTime);
        res.status(201).json({ status: 'success', timetable });
    } catch (error) {
        console.error("Error allocating AI timetable:", error);
        return next(new HttpError(error.message || "Failed to allocate timetable", 500));
    }
};

// Get timetable for a specific day (Public)
const getTimetableByDayController = async (req, res, next) => {
    try {
        const { day } = req.params;
        const timetables = await getTimetableByDay(day);

        if (!timetables || timetables.length === 0) {
            return next(new HttpError("No timetables found for this day", 404));
        }

        res.json({ status: 'success', timetables });
    } catch (error) {
        console.error("Error retrieving timetables:", error);
        return next(new HttpError(error.message || "Failed to fetch timetables", 500));
    }
};

// Get timetable by ID
const getTimetableByIdController = async (req, res, next) => {
    try {
        const timetable = await getTimetableById(req.params.id);
        res.json({ status: 'success', timetable });
    } catch (error) {
        console.error("Error retrieving timetable by ID:", error);
        return next(new HttpError(error.message || "Failed to fetch timetable", 500));
    }
};

// Delete timetable entry
const deleteTimetableController = async (req, res, next) => {
    try {
        if (!req.user || req.user.role !== 'admin') {
            return next(new HttpError("Unauthorized: Admins only", 403));
        }

        await deleteTimetable(req.params.id);
        res.json({ status: 'success', message: "Timetable entry deleted successfully" });
    } catch (error) {
        console.error("Error deleting timetable:", error);
        return next(new HttpError(error.message || "Failed to delete timetable", 500));
    }
};

module.exports = {
    allocateTimetableAIController,
    getTimetableByDayController,
    getTimetableByIdController,
    deleteTimetableController
};
