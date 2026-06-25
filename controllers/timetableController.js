const timetableService = require("../service/timetableService");
const alertService = require('../service/alertService');
const { timetableQueue } = require('../service/queueService');
const db = require('../database/pgDb');
const cache = require('../service/redisService');

const allocateTimetableAIController = async (req, res, next) => {
    const { sessionId } = req.body;
    const tenantId = req.tenantId;
    if (!sessionId) {
        return res.status(422).json({ message: "Academic session ID is required" });
    }

    try {
        // Enforce that session belongs to admin's tenant
        const sessionRes = await db.query('SELECT tenant_id FROM academic_sessions WHERE id = $1', [sessionId]);
        if (sessionRes.rows.length === 0) {
            return res.status(404).json({ message: "Academic session not found" });
        }
        if (sessionRes.rows[0].tenant_id !== tenantId) {
            return res.status(403).json({ message: "Access denied: academic session belongs to a different tenant" });
        }

        const job = await timetableQueue.add('generate-timetable', { 
            sessionId, 
            userId: req.user ? req.user.id : "system",
            tenantId
        });

        // Invalidate timetable caches for this tenant
        await cache.clearPattern(`timetable:${tenantId}:*`);

        res.status(202).json({ 
            status: 'queued', 
            message: 'Timetable generation has been enqueued asynchronously.', 
            jobId: job.id 
        });
    } catch (error) {
        console.error("Error enqueuing timetable job:", error);
        return res.status(500).json({ message: "Failed to enqueue timetable job" });
    }
};

const publishTimetableController = async (req, res, next) => {
    const { sessionId } = req.params;
    const tenantId = req.tenantId;

    try {
        const result = await db.query(
            `UPDATE timetable_versions 
             SET status = 'PUBLISHED' 
             WHERE academic_session_id = $1 AND tenant_id = $2 RETURNING *`,
            [sessionId, tenantId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Timetable version not found or tenant mismatch" });
        }

        // Invalidate timetable caches for this tenant
        await cache.clearPattern(`timetable:${tenantId}:*`);

        res.json({ 
            status: 'success', 
            message: `Successfully published timetable for session ${sessionId}.`
        });
    } catch (error) {
        console.error("Error publishing timetable:", error);
        return res.status(500).json({ message: "Failed to publish timetable" });
    }
};

const lockTimetableController = async (req, res, next) => {
    const { allocationId } = req.params;
    const { lockReason } = req.body;
    const userId = req.user ? req.user.id : 'admin';
    const tenantId = req.tenantId;

    try {
        // Verify entry belongs to the tenant
        const allocRes = await db.query('SELECT tenant_id FROM timetable_allocations WHERE id = $1', [allocationId]);
        if (allocRes.rows.length === 0) {
            return res.status(404).json({ message: "Timetable allocation not found" });
        }
        if (allocRes.rows[0].tenant_id !== tenantId) {
            return res.status(403).json({ message: "Access denied: allocation belongs to a different tenant" });
        }

        const result = await db.query(
            `UPDATE timetable_allocations 
             SET locked_by = $1, locked_at = NOW(), lock_reason = $2 
             WHERE id = $3 AND tenant_id = $4 RETURNING *`,
            [userId, lockReason || "Manual lock override", allocationId, tenantId]
        );

        // Invalidate timetable caches for this tenant
        await cache.clearPattern(`timetable:${tenantId}:*`);

        res.json({ status: 'success', allocation: result.rows[0] });
    } catch (error) {
        console.error("Error locking allocation:", error);
        return res.status(500).json({ message: "Failed to lock allocation" });
    }
};

const getTimetableByDayController = async (req, res, next) => {
    try {
        const { day } = req.params;
        const tenantId = req.tenantId;
        const cacheKey = `timetable:${tenantId}:day:${day.toUpperCase()}`;
        const cached = await cache.getCache(cacheKey);
        if (cached) {
            return res.json({ status: 'success', timetables: cached, source: "cache" });
        }

        const timetables = await timetableService.getTimetableByDay(day, tenantId);

        if (!timetables || timetables.length === 0) {
            return res.status(404).json({ message: "No timetable found for today" });
        }

        await cache.setCache(cacheKey, timetables, 300);
        res.json({ status: 'success', timetables });
    } catch (error) {
        console.error("Error retrieving timetables:", error);
        return res.status(500).json({ message: "Failed to fetch the timetable " });
    }
};

const getTimetableByIdController = async (req, res, next) => {
    try {
        const { id } = req.params;
        const tenantId = req.tenantId;
        const cacheKey = `timetable:${tenantId}:id:${id}`;
        const cached = await cache.getCache(cacheKey);
        if (cached) {
            return res.json({ status: 'success', timetable: cached, source: "cache" });
        }

        const timetable = await timetableService.getTimetableById(id, tenantId);
        if (!timetable) {
            return res.status(404).json({ message: "Timetable not found" });
        }

        await cache.setCache(cacheKey, timetable, 300);
        res.json({ status: 'success', timetable });
    } catch (error) {
        console.error("Error retrieving timetable by ID:", error);
        return res.status(500).json({ message: "Failed to fetch timetable" });
    }
};

const deleteTimetableController = async (req, res, next) => {
    try {
        const { id } = req.params;
        const tenantId = req.tenantId;
        const result = await timetableService.deleteTimetable(id, tenantId);
        
        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Timetable entry not found or tenant mismatch" });
        }

        await cache.clearPattern(`timetable:${tenantId}:*`);
        res.json({ status: 'success', message: "Timetable entry deleted successfully" });
    } catch (error) {
        console.error("Error deleting timetable:", error);
        return res.status(500).json({ message: "Failed to delete timetable" });
    }
};

const getUserTimetableController = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;
        const tenantId = req.user.tenantId;

        if (!userId || !userRole || !tenantId) {
            return res.status(401).json({ message: "Unauthorized: Missing authentication context." });
        }

        const cacheKey = `timetable:${tenantId}:user:${userId}`;
        const cached = await cache.getCache(cacheKey);
        if (cached) {
            return res.json({ status: 'success', timetables: cached, source: "cache" });
        }

        const timetables = await timetableService.getTimetableForUser(userId, userRole, tenantId);

        if (!timetables || timetables.length === 0) {
            return res.status(404).json({ message: "No timetable found for this user." });
        }

        await cache.setCache(cacheKey, timetables, 300);
        res.json({ status: 'success', timetables });
    } catch (error) {
        console.error("Error retrieving user timetable:", error);
        return res.status(500).json({ message: "Failed to fetch user timetable." });
    }
};

module.exports = {
    allocateTimetableAIController,
    publishTimetableController,
    lockTimetableController,
    getTimetableByDayController,
    getTimetableByIdController,
    deleteTimetableController,
    getUserTimetableController,
};