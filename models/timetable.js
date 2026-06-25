const mongoose = require('mongoose');

const timetableSchema = new mongoose.Schema({
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    venue: { type: mongoose.Schema.Types.ObjectId, ref: 'Venue' },
    instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    day: String,
    startTime: Number,
    endTime: Number,
    session: { type: String, required: true },
    status: { type: String, enum: ['DRAFT', 'UNDER_REVIEW', 'APPROVED', 'PUBLISHED', 'ARCHIVED'], default: 'DRAFT' },
    version: { type: Number, default: 1 },
    lockedBy: { type: String, default: null },
    lockedAt: { type: Date, default: null },
    lockReason: { type: String, default: null }
});

module.exports = mongoose.model('Timetable', timetableSchema);