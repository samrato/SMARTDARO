
const {
    allocateTimetableAI,
    getTimetableByDay,
    getTimetableById,
    deleteTimetable
  } = require('../service/timetableService');
  
  const allocateTimetableAIController = async (req, res) => {
    try {
      const { courseId, instructorId, students, preferredDay, preferredStartTime, preferredEndTime } = req.body;
      if (!courseId || !instructorId || !students || !preferredDay || !preferredStartTime || !preferredEndTime) {
        return res.status(400).json({ message: "All fields are required" });
      }
      const timetable = await allocateTimetableAI(courseId, instructorId, students, preferredDay, preferredStartTime, preferredEndTime);
      res.status(201).json({ status: 'success', timetable });
    } catch (error) {
      console.error("AI Allocation Error:", error);
      res.status(500).json({ message: error.message });
    }
  };
  
  const getTimetableByDayController = async (req, res) => {
    try {
      const { day } = req.params;
      const timetables = await getTimetableByDay(day);
      if (!timetables || timetables.length === 0) {
        return res.status(404).json({ message: "No timetable found for this day" });
      }
      res.json({ status: 'success', timetables });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  
  const getTimetableByIdController = async (req, res) => {
    try {
      const timetable = await getTimetableById(req.params.id);
      res.json({ status: 'success', timetable });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  
  const deleteTimetableController = async (req, res) => {
    try {
      const result = await deleteTimetable(req.params.id);
      res.json({ status: 'success', message: result.message });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  
  module.exports = {
    allocateTimetableAIController,
    getTimetableByDayController,
    getTimetableByIdController,
    deleteTimetableController
  };
  