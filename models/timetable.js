const mongoose = require('mongoose');

const timetableSchema = new mongoose.Schema({
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    venue: { type: mongoose.Schema.Types.ObjectId, ref: 'Venue' },
    instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'Instructor' },
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
    day: String,
    startTime: Number,
    endTime: Number
});

module.exports = mongoose.model('Timetable', timetableSchema);