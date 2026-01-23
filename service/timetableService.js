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

    async getTimetableForUser(userId, userRole) {
        let query = {};
        if (userRole === 'instructor') {
            query = { instructor: userId };
        } else if (userRole === 'student') {
            const enrolledCourses = await Course.find({ students: userId }).select('_id');
            const courseIds = enrolledCourses.map(course => course._id);
            query = { course: { $in: courseIds } };
        } else {
            return [];
        }

        return await Timetable.find(query).populate('course venue instructor');
    }
}

module.exports = new TimetableService();