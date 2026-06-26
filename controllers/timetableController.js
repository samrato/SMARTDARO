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

const unpublishTimetableController = async (req, res, next) => {
    const { sessionId } = req.params;
    const tenantId = req.tenantId;

    try {
        const result = await db.query(
            `UPDATE timetable_versions 
             SET status = 'DRAFT' 
             WHERE academic_session_id = $1 AND tenant_id = $2 RETURNING *`,
            [sessionId, tenantId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Timetable version not found or tenant mismatch" });
        }

        await cache.clearPattern(`timetable:${tenantId}:*`);

        res.json({ 
            status: 'success', 
            message: `Successfully unpublished timetable for session ${sessionId}.`
        });
    } catch (error) {
        console.error("Error unpublishing timetable:", error);
        return res.status(500).json({ message: "Failed to unpublish timetable" });
    }
};

const getDraftTimetablesController = async (req, res, next) => {
    try {
        const timetables = await timetableService.getDraftTimetables(req.tenantId);
        res.json({ status: "success", timetables });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch draft timetables" });
    }
};

const getPublishedTimetablesController = async (req, res, next) => {
    try {
        const timetables = await timetableService.getPublishedTimetables(req.tenantId);
        res.json({ status: "success", timetables });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch published timetables" });
    }
};

const unlockTimetableController = async (req, res, next) => {
    const { allocationId } = req.params;
    const tenantId = req.tenantId;

    try {
        const result = await db.query(
            `UPDATE timetable_allocations 
             SET locked_by = NULL, locked_at = NULL, lock_reason = NULL 
             WHERE id = $1 AND tenant_id = $2 RETURNING *`,
            [allocationId, tenantId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Timetable allocation not found or tenant mismatch" });
        }

        await cache.clearPattern(`timetable:${tenantId}:*`);

        res.json({ status: 'success', allocation: result.rows[0] });
    } catch (error) {
        console.error("Error unlocking allocation:", error);
        res.status(500).json({ message: "Failed to unlock allocation" });
    }
};

const getLockedTimetablesController = async (req, res, next) => {
    try {
        const timetables = await timetableService.getLockedTimetables(req.tenantId);
        res.json({ status: "success", timetables });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch locked timetables" });
    }
};

const getTimetableVersionsController = async (req, res, next) => {
    try {
        const versions = await timetableService.getTimetableVersions(req.tenantId);
        res.json({ status: "success", versions });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch timetable versions" });
    }
};

const getTimetableVersionByIdController = async (req, res, next) => {
    try {
        const version = await timetableService.getTimetableVersionById(req.params.id, req.tenantId);
        if (!version) {
            return res.status(404).json({ message: "Version not found" });
        }
        res.json({ status: "success", version });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch version" });
    }
};

const restoreTimetableVersionController = async (req, res, next) => {
    const { id } = req.params;
    const tenantId = req.tenantId;

    try {
        const version = await timetableService.restoreTimetableVersion(id, tenantId);
        await cache.clearPattern(`timetable:${tenantId}:*`);
        res.json({ status: "success", message: "Version restored successfully", version });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message || "Failed to restore timetable version" });
    }
};

const getStudentTimetableController = async (req, res, next) => {
    const { id, sessionId } = req.params;
    const tenantId = req.tenantId;

    try {
        const timetables = await timetableService.getStudentTimetable(id, tenantId, sessionId);
        res.json({ status: "success", timetables });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to fetch student timetable" });
    }
};

const getLecturerTimetableController = async (req, res, next) => {
    const { id } = req.params;
    const tenantId = req.tenantId;

    try {
        const timetables = await timetableService.getLecturerTimetable(id, tenantId);
        res.json({ status: "success", timetables });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to fetch lecturer timetable" });
    }
};

const getDepartmentTimetableController = async (req, res, next) => {
    const { id } = req.params;
    const tenantId = req.tenantId;

    try {
        const timetables = await timetableService.getDepartmentTimetable(id, tenantId);
        res.json({ status: "success", timetables });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to fetch department timetable" });
    }
};

const getRoomTimetableController = async (req, res, next) => {
    const { id } = req.params;
    const tenantId = req.tenantId;

    try {
        const timetables = await timetableService.getRoomTimetable(id, tenantId);
        res.json({ status: "success", timetables });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to fetch room timetable" });
    }
};

const getStudentCurrentTimetableController = async (req, res, next) => {
    const { id } = req.params;
    const tenantId = req.tenantId;

    try {
        const sessionRes = await db.query(
            'SELECT id FROM academic_sessions WHERE tenant_id = $1 AND is_active = TRUE LIMIT 1',
            [tenantId]
        );
        if (sessionRes.rows.length === 0) {
            return res.status(404).json({ message: "No active academic session found" });
        }
        const sessionId = sessionRes.rows[0].id;
        const timetables = await timetableService.getStudentTimetable(id, tenantId, sessionId);
        res.json({ status: "success", timetables });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to fetch student current timetable" });
    }
};

const getLecturerCurrentTimetableController = async (req, res, next) => {
    const { id } = req.params;
    const tenantId = req.tenantId;

    try {
        const sessionRes = await db.query(
            'SELECT id FROM academic_sessions WHERE tenant_id = $1 AND is_active = TRUE LIMIT 1',
            [tenantId]
        );
        if (sessionRes.rows.length === 0) {
            return res.status(404).json({ message: "No active academic session found" });
        }
        const sessionId = sessionRes.rows[0].id;
        const timetables = await timetableService.getLecturerTimetable(id, tenantId, sessionId);
        res.json({ status: "success", timetables });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to fetch lecturer current timetable" });
    }
};

module.exports = {
    allocateTimetableAIController,
    publishTimetableController,
    unpublishTimetableController,
    getDraftTimetablesController,
    getPublishedTimetablesController,
    lockTimetableController,
    unlockTimetableController,
    getLockedTimetablesController,
    getTimetableByDayController,
    getTimetableByIdController,
    deleteTimetableController,
    getUserTimetableController,
    getTimetableVersionsController,
    getTimetableVersionByIdController,
    restoreTimetableVersionController,
    getStudentTimetableController,
    getLecturerTimetableController,
    getDepartmentTimetableController,
    getRoomTimetableController,
    getStudentCurrentTimetableController,
    getLecturerCurrentTimetableController
};