const timetableService = require("../service/timetableService");
const alertService = require('../service/alertService');
const User = require('../models/user');

const allocateTimetableAIController = async (req, res, next) => {
    try {
        const timetable = await timetableService.generateTimetable();
        const users = await User.find();
        users.forEach(user => {
            alertService.sendAlert(user, 'A new timetable has been generated.');
        });
        res.status(201).json({ status: 'success', timetable });
    } catch (error) {
        console.error("Error allocating AI timetable:", error);
        return res.status(500).json({ message: "Failed to allocate timetable " });
    }
};

const getTimetableByDayController = async (req, res, next) => {
    try {
        const { day } = req.params;
        const timetables = await timetableService.getTimetableByDay(day);

        if (!timetables || timetables.length === 0) {
            return res.status(404).json({ message: "No timetable found for this today" });
        }

        res.json({ status: 'success', timetables });
    } catch (error) {
        console.error("Error retrieving timetables:", error);
        return res.status(500).json({ message: "Failed to fetch the timetable " });
    }
};

const getTimetableByIdController = async (req, res, next) => {
    try {
        const timetable = await timetableService.getTimetableById(req.params.id);
        res.json({ status: 'success', timetable });
    } catch (error) {
        console.error("Error retrieving timetable by ID:", error);
        return res.status(500).json({ message: "Failed to fetch timetable" });
    }
};

const deleteTimetableController = async (req, res, next) => {
    try {
        await timetableService.deleteTimetable(req.params.id);
        res.json({ status: 'success', message: "Timetable entry deleted successfully" });
    } catch (error) {
        console.error("Error deleting timetable:", error);
        return res.status(500).json({ message: "Failed to delete timetable" });
    }
};

module.exports = {
    allocateTimetableAIController,
    getTimetableByDayController,
    getTimetableByIdController,
    deleteTimetableController,
};