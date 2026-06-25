const timetableService = require("../service/timetableService");
const alertService = require('../service/alertService');
const { timetableQueue } = require('../service/queueService');
const User = require('../models/user');
const db = require('../database/pgDb');
const cache = require('../service/redisService');

const allocateTimetableAIController = async (req, res, next) => {
    const { sessionId } = req.body;
    if (!sessionId) {
        return res.status(422).json({ message: "Academic session ID is required" });
    }

    try {
        const job = await timetableQueue.add('generate-timetable', { 
            sessionId, 
            userId: req.user ? req.user.id : "system" 
        });

        // Invalidate timetable caches
        await cache.clearPattern("timetable:*");

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
        await db.query(
            `UPDATE timetable_versions 
             SET status = 'PUBLISHED' 
             WHERE academic_session_id = $1 AND tenant_id = $2`,
            [sessionId, tenantId]
        );

        // Invalidate timetable caches
        await cache.clearPattern("timetable:*");

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

    try {
        const result = await db.query(
            `UPDATE timetable_allocations 
             SET locked_by = $1, locked_at = NOW(), lock_reason = $2 
             WHERE id = $3 RETURNING *`,
            [userId, lockReason || "Manual lock override", allocationId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Timetable allocation not found" });
        }

        // Invalidate timetable caches
        await cache.clearPattern("timetable:*");

        res.json({ status: 'success', allocation: result.rows[0] });
    } catch (error) {
        console.error("Error locking allocation:", error);
        return res.status(500).json({ message: "Failed to lock allocation" });
    }
};

const getTimetableByDayController = async (req, res, next) => {
    try {
        const { day } = req.params;
        const cacheKey = `timetable:day:${day.toUpperCase()}`;
        const cached = await cache.getCache(cacheKey);
        if (cached) {
            return res.json({ status: 'success', timetables: cached, source: "cache" });
        }

        const timetables = await timetableService.getTimetableByDay(day);

        if (!timetables || timetables.length === 0) {
            return res.status(404).json({ message: "No timetable found for this today" });
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
        const cacheKey = `timetable:id:${id}`;
        const cached = await cache.getCache(cacheKey);
        if (cached) {
            return res.json({ status: 'success', timetable: cached, source: "cache" });
        }

        const timetable = await timetableService.getTimetableById(id);
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
        await timetableService.deleteTimetable(id);
        await cache.clearPattern("timetable:*");
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

        if (!userId || !userRole) {
            return res.status(401).json({ message: "Unauthorized: User ID or role not found." });
        }

        const cacheKey = `timetable:user:${userId}`;
        const cached = await cache.getCache(cacheKey);
        if (cached) {
            return res.json({ status: 'success', timetables: cached, source: "cache" });
        }

        const timetables = await timetableService.getTimetableForUser(userId, userRole);

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