const Venue = require('../models/venue');
const Course = require('../models/course');

class AllocationService {
    async allocateRoom(courseId) {
        const course = await Course.findById(courseId);
        if (!course) {
            throw new Error('Course not found');
        }

        const venues = await Venue.find({
            capacity: { $gte: course.students.length },
            isAvailable: true
        }).sort('capacity');

        if (venues.length === 0) {
            throw new Error('No suitable venue found');
        }

        const allocatedVenue = venues[0];
        allocatedVenue.isAvailable = false;
        await allocatedVenue.save();

        return allocatedVenue;
    }
}

module.exports = new AllocationService();
