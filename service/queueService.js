const db = require('../database/pgDb');
const timetableService = require('./timetableService');
const alertService = require('./alertService');

// Table-based Queue Client using PostgreSQL
const timetableQueue = {
    add: async (name, data) => {
        const payload = JSON.stringify(data);
        const result = await db.query(
            `INSERT INTO jobs (queue_name, payload, status)
             VALUES ($1, $2, 'pending') RETURNING id`,
            ['timetable-queue', payload]
        );
        return { id: result.rows[0].id };
    }
};

// Background Worker Loop
const startWorker = () => {
    const pollInterval = 3000; // Poll every 3 seconds

    setInterval(async () => {
        try {
            // Select and lock a pending job using FOR UPDATE SKIP LOCKED
            const pickJobRes = await db.query(
                `UPDATE jobs 
                 SET status = 'processing', updated_at = NOW() 
                 WHERE id = (
                     SELECT id FROM jobs 
                     WHERE queue_name = 'timetable-queue' AND status = 'pending' 
                     ORDER BY id ASC 
                     FOR UPDATE SKIP LOCKED 
                     LIMIT 1
                 ) RETURNING *`
            );

            if (pickJobRes.rows.length === 0) {
                return; // No pending jobs
            }

            const job = pickJobRes.rows[0];
            const { sessionId, userId, tenantId } = job.payload;

            console.log(`[Worker] Starting async timetable generation for job ${job.id}, session ${sessionId}, tenant ${tenantId}, triggered by ${userId}`);
            alertService.sendAlert({ email: "admin@smartdaro.edu" }, `Timetable generation started for session ${sessionId}`);

            try {
                const timetable = await timetableService.generateTimetable(sessionId, userId, tenantId);
                
                // Mark job as completed
                await db.query(
                    "UPDATE jobs SET status = 'completed', updated_at = NOW() WHERE id = $1",
                    [job.id]
                );

                console.log(`[Worker] Completed job ${job.id} successfully.`);
                alertService.sendAlert({ email: "admin@smartdaro.edu" }, `Timetable generation completed successfully for session ${sessionId}`);
            } catch (error) {
                console.error(`[Worker] Job ${job.id} failed:`, error);
                
                // Mark job as failed
                await db.query(
                    "UPDATE jobs SET status = 'failed', error = $1, updated_at = NOW() WHERE id = $2",
                    [error.message || String(error), job.id]
                );

                alertService.sendAlert({ email: "admin@smartdaro.edu" }, `Timetable generation failed for session ${sessionId}: ${error.message}`);
            }
        } catch (pollError) {
            console.error("[Worker] Polling loop error:", pollError);
        }
    }, pollInterval);

    console.log("🚀 PostgreSQL Job Queue Worker started successfully");
};

// Start the worker immediately
startWorker();

module.exports = {
    timetableQueue,
    startWorker
};
