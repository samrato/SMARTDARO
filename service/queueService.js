const { Queue, Worker } = require('bullmq');
const redisConnection = require('./redisService');
const timetableService = require('./timetableService');
const alertService = require('./alertService');

const timetableQueue = new Queue('timetable-queue', { connection: redisConnection });

const worker = new Worker('timetable-queue', async (job) => {
    const { sessionId, userId } = job.data;
    console.log(`🚀 Starting async timetable generation for session ${sessionId}, triggered by ${userId}`);
    
    alertService.sendAlert({ email: "admin@smartdaro.edu" }, `Timetable generation started for session ${sessionId}`);

    try {
        const timetable = await timetableService.generateTimetable(sessionId, userId);
        console.log(`✅ Async timetable generation completed successfully for session ${sessionId}`);
        
        alertService.sendAlert({ email: "admin@smartdaro.edu" }, `Timetable generation completed successfully for session ${sessionId}`);
        
        return timetable;
    } catch (error) {
        console.error(`❌ Async timetable generation failed for session ${sessionId}:`, error);
        alertService.sendAlert({ email: "admin@smartdaro.edu" }, `Timetable generation failed for session ${sessionId}: ${error.message}`);
        throw error;
    }
}, { connection: redisConnection });

module.exports = {
    timetableQueue,
    worker
};
