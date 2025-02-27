const Timetable = require('../models/timetable');
const Venue = require('../models/venue');
// const brain = require('brain.js');

// Function to check if a venue is available
const isVenueAvailable = async (venueId, day, startTime, endTime) => {
    const clash = await Timetable.findOne({
        venue: venueId,
        day,
        $or: [
            { startTime: { $lt: endTime, $gte: startTime } },
            { endTime: { $gt: startTime, $lte: endTime } },
            { startTime: { $lte: startTime }, endTime: { $gte: endTime } }
        ]
    });
    return !clash; // Returns true if no clashes
};

// AI-based function to optimize scheduling
const allocateTimetableAI = async (courseId, instructorId, students, preferredDay, preferredStartTime, preferredEndTime) => {
    try {
        const venues = await Venue.find({ isAvailable: true });
        if (!venues.length) throw new Error('No available venues');

        let bestVenue = null;
        let bestSlot = null;

        // AI Model
        const net = new brain.NeuralNetwork();
        const timetableData = await Timetable.find().lean();

        const trainingData = timetableData.map(entry => ({
            input: [entry.startTime / 24, entry.endTime / 24],
            output: [entry.venue ? 1 : 0]
        }));

        if (trainingData.length > 0) {
            net.train(trainingData, { log: true, iterations: 1000 });
        }

        for (const venue of venues) {
            const isAvailable = await isVenueAvailable(venue._id, preferredDay, preferredStartTime, preferredEndTime);
            if (isAvailable) {
                const score = net.run([preferredStartTime / 24, preferredEndTime / 24]);

                if (!bestSlot || score > bestSlot.score) {
                    bestVenue = venue;
                    bestSlot = { day: preferredDay, startTime: preferredStartTime, endTime: preferredEndTime, score };
                }
            }
        }

        if (!bestVenue) throw new Error('No available slots found');

        const timetable = new Timetable({
            course: courseId,
            venue: bestVenue._id,
            instructor: instructorId,
            students,
            day: bestSlot.day,
            startTime: bestSlot.startTime,
            endTime: bestSlot.endTime
        });

        await timetable.save();
        return timetable;
    } catch (error) {
        throw error;
    }
};

// Get timetable for a specific day
const getTimetableByDay = async (day) => {
    try {
        return await Timetable.find({ day })
            .populate('course venue instructor students');
    } catch (error) {
        throw error;
    }
};

// Get timetable by ID
const getTimetableById = async (id) => {
    try {
        const timetable = await Timetable.findById(id).populate('course venue instructor students');
        if (!timetable) throw new Error("Timetable not found");
        return timetable;
    } catch (error) {
        throw error;
    }
};

// Delete a timetable entry
const deleteTimetable = async (id) => {
    try {
        const timetable = await Timetable.findByIdAndDelete(id);
        if (!timetable) throw new Error("Timetable not found");
        return { message: "Timetable entry deleted successfully" };
    } catch (error) {
        throw error;
    }
};

module.exports = { allocateTimetableAI, getTimetableByDay, getTimetableById, deleteTimetable };
