
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
            return res.status(403).json({message:"Unauthorized:Admin only"})
        }

        const { courseId, instructorId, students, preferredDay, preferredStartTime, preferredEndTime } = req.body;

        if (!courseId || !instructorId || !students || !preferredDay || !preferredStartTime || !preferredEndTime) {
            return res.status(400).json({message:"All fields are required"})
        }

        const timetable = await allocateTimetableAI(courseId, instructorId, students, preferredDay, preferredStartTime, preferredEndTime);
        res.status(201).json({ status: 'success', timetable });
    } catch (error) {
        console.error("Error allocating AI timetable:", error);
        return res.status(500).json({message:"Failed to allocate timetable "})
         
    }
};

// Get timetable for a specific day (Public)
const getTimetableByDayController = async (req, res, next) => {
    try {
        const { day } = req.params;
        const timetables = await getTimetableByDay(day);

        if (!timetables || timetables.length === 0) {
            return res.status(404).json({message:"No timetable found for this today"})
            
        }

        res.json({ status: 'success', timetables });
    } catch (error) {
        console.error("Error retrieving timetables:", error);
        return res.json(500).json({message:"Failed to fetch the timetable "})
        
    }
};

// Get timetable by ID
const getTimetableByIdController = async (req, res, next) => {
    try {
        const timetable = await getTimetableById(req.params.id);
        res.json({ status: 'success', timetable });
    } catch (error) {
        console.error("Error retrieving timetable by ID:", error);
        return res.status(500).json({message:"Failed to fetch timetable"})
        
    }
};

// Delete timetable entry
const deleteTimetableController = async (req, res, next) => {
    try {
        if (!req.user || req.user.role !== 'admin') {
            return res.status(403).json({message:"Unauthorized: Admins only"})
            
        }

        await deleteTimetable(req.params.id);
        res.json({ status: 'success', message: "Timetable entry deleted successfully" });
    } catch (error) {
        console.error("Error deleting timetable:", error);
        return res.status(500).json({message:"Failed to delete timeetable"})
        
    }
};

module.exports = {
    allocateTimetableAIController,
    getTimetableByDayController,
    getTimetableByIdController,
    deleteTimetableController
};
