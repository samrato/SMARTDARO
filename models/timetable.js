const mongoose = require('mongoose');

const timetableSchema = new mongoose.Schema({
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    venue: { type: mongoose.Schema.Types.ObjectId, ref: 'Venue' },
    instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    day: String,
    startTime: Number,
    endTime: Number
});

module.exports = mongoose.model('Timetable', timetableSchema);