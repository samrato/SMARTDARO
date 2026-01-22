const Timetable = require('../models/timetable');
const Course = require('../models/course');
const Venue = require('../models/venue');
const User = require('../models/user');

class TimetableService {
    async generateTimetable() {
        // ... (existing generateTimetable method)
    }

    async getTimetableByDay(day) {
        return await Timetable.find({ day }).populate('course venue instructor');
    }

    async getTimetableById(id) {
        return await Timetable.findById(id).populate('course venue instructor');
    }

    async deleteTimetable(id) {
        return await Timetable.findByIdAndDelete(id);
    }
}

module.exports = new TimetableService();