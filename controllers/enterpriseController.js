const service = require('../service/enterpriseService');
const { logAudit } = require('../middleware/auditLogger');

// Room Tags
const createRoomTag = async (req, res) => {
    const { tagName } = req.body;
    const tenantId = req.tenantId;
    if (!tagName) return res.status(422).json({ message: "Tag name is required" });
    try {
        const tag = await service.createRoomTag({ tenantId, tagName });
        await logAudit(req, 'CREATE', 'room_tags', tag.id);
        res.status(201).json({ status: "success", tag });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message || "Failed to create room tag" });
    }
};

const getRoomTags = async (req, res) => {
    try {
        const tags = await service.getRoomTags(req.tenantId);
        res.json({ status: "success", tags });
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch room tags" });
    }
};

const assignTagToVenue = async (req, res) => {
    const { id } = req.params; // venueId
    const { tagId } = req.body;
    const tenantId = req.tenantId;
    if (!tagId) return res.status(422).json({ message: "tagId is required" });
    try {
        const relation = await service.assignTagToVenue({ tenantId, venueId: id, tagId });
        await logAudit(req, 'ASSIGN_TAG', 'rooms', id);
        res.status(201).json({ status: "success", relation });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to assign tag to venue" });
    }
};

const getVenueTags = async (req, res) => {
    try {
        const tags = await service.getVenueTags(req.tenantId, req.params.id);
        res.json({ status: "success", tags });
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch venue tags" });
    }
};

const deleteVenueTag = async (req, res) => {
    try {
        await service.deleteVenueTag(req.tenantId, req.params.id, req.params.tagId);
        await logAudit(req, 'REMOVE_TAG', 'rooms', req.params.id);
        res.json({ status: "success", message: "Tag removed from venue" });
    } catch (err) {
        res.status(500).json({ message: "Failed to remove tag" });
    }
};

// Student Accommodations
const upsertAccommodation = async (req, res) => {
    const { studentId, accommodationType, extraTimeRatio } = req.body;
    const tenantId = req.tenantId;
    if (!studentId || !accommodationType) return res.status(422).json({ message: "studentId and accommodationType are required" });
    try {
        const accommodation = await service.upsertAccommodation({ tenantId, studentId, accommodationType, extraTimeRatio });
        await logAudit(req, 'UPSERT_ACCOMMODATION', 'users', studentId);
        res.json({ status: "success", accommodation });
    } catch (err) {
        res.status(500).json({ message: "Failed to set accommodation" });
    }
};

const getAccommodation = async (req, res) => {
    try {
        const accommodation = await service.getAccommodation(req.tenantId, req.params.studentId);
        res.json({ status: "success", accommodation });
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch accommodation" });
    }
};

// Academic Calendar
const createCalendarEvent = async (req, res) => {
    const { title, eventDate, description } = req.body;
    const tenantId = req.tenantId;
    if (!title || !eventDate) return res.status(422).json({ message: "title and eventDate are required" });
    try {
        const event = await service.createCalendarEvent({ tenantId, title, eventDate, description });
        await logAudit(req, 'CREATE_EVENT', 'academic_calendar_events', event.id);
        res.status(201).json({ status: "success", event });
    } catch (err) {
        res.status(500).json({ message: "Failed to create event" });
    }
};

const getCalendarEvents = async (req, res) => {
    try {
        const events = await service.getCalendarEvents(req.tenantId);
        res.json({ status: "success", events });
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch events" });
    }
};

const updateCalendarEvent = async (req, res) => {
    try {
        const event = await service.updateCalendarEvent(req.params.id, req.tenantId, req.body);
        if (!event) return res.status(404).json({ message: "Event not found" });
        await logAudit(req, 'UPDATE_EVENT', 'academic_calendar_events', req.params.id);
        res.json({ status: "success", event });
    } catch (err) {
        res.status(500).json({ message: "Failed to update event" });
    }
};

const deleteCalendarEvent = async (req, res) => {
    try {
        await service.deleteCalendarEvent(req.params.id, req.tenantId);
        await logAudit(req, 'DELETE_EVENT', 'academic_calendar_events', req.params.id);
        res.json({ status: "success", message: "Event deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: "Failed to delete event" });
    }
};

// Notifications
const getNotifications = async (req, res) => {
    try {
        const notifications = await service.getNotifications(req.tenantId, req.user.id);
        res.json({ status: "success", notifications });
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch notifications" });
    }
};

const getUnreadNotifications = async (req, res) => {
    try {
        const notifications = await service.getUnreadNotifications(req.tenantId, req.user.id);
        res.json({ status: "success", notifications });
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch unread notifications" });
    }
};

const markAsRead = async (req, res) => {
    try {
        const notification = await service.markAsRead(req.params.id, req.tenantId, req.user.id);
        if (!notification) return res.status(404).json({ message: "Notification not found" });
        res.json({ status: "success", notification });
    } catch (err) {
        res.status(500).json({ message: "Failed to update notification" });
    }
};

// Audit Logs
const getAuditLogs = async (req, res) => {
    try {
        const logs = await service.getAuditLogs(req.tenantId);
        res.json({ status: "success", logs });
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch audit logs" });
    }
};

const getAuditLogsByEntity = async (req, res) => {
    try {
        const logs = await service.getAuditLogsByEntity(req.tenantId, req.params.entityId);
        res.json({ status: "success", logs });
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch audit logs" });
    }
};

const getAuditLogsByUser = async (req, res) => {
    try {
        const logs = await service.getAuditLogsByUser(req.tenantId, req.params.userId);
        res.json({ status: "success", logs });
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch audit logs" });
    }
};

const getTenantSettings = async (req, res) => {
    try {
        const settings = await service.getTenantSettings(req.tenantId);
        res.json({ status: "success", settings });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to fetch tenant settings" });
    }
};

const updateTenantSettings = async (req, res) => {
    try {
        const settings = await service.updateTenantSettings(req.tenantId, req.body.settings);
        const cache = require('../service/redisService');
        await cache.deleteCache(`tenant_settings:${req.tenantId}`);
        await logAudit(req, 'UPDATE_SETTINGS', 'tenants', req.tenantId);
        res.json({ status: "success", settings });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to update tenant settings" });
    }
};

const registerTenant = async (req, res) => {
    try {
        const { tenantName, domain, adminName, adminEmail, adminPassword, settings } = req.body;
        
        if (!tenantName || !domain || !adminName || !adminEmail || !adminPassword) {
            return res.status(422).json({ message: "Fill in all fields" });
        }

        const db = require('../database/pgDb');
        const bcrypt = require('bcryptjs');

        // Check if admin user already exists
        const userCheck = await db.query("SELECT id FROM users WHERE LOWER(email) = LOWER($1)", [adminEmail]);
        if (userCheck.rows.length > 0) {
            return res.status(422).json({ message: "Admin email already exists" });
        }

        // Insert new tenant
        const tenantRes = await db.query(
            "INSERT INTO tenants (name, domain, settings) VALUES ($1, $2, $3) RETURNING id, name, domain, settings",
            [tenantName, domain.toLowerCase(), JSON.stringify(settings || { schoolType: "university" })]
        );
        const tenant = tenantRes.rows[0];

        // Hash admin password
        const hashedPassword = await bcrypt.hash(adminPassword, 10);

        // Insert admin user
        const userRes = await db.query(
            `INSERT INTO users (full_name, email, password, role, is_admin, tenant_id)
             VALUES ($1, $2, $3, 'admin', true, $4) RETURNING id, full_name as "fullName", email, role`,
            [adminName, adminEmail.toLowerCase(), hashedPassword, tenant.id]
        );
        const user = userRes.rows[0];

        res.status(201).json({
            status: "success",
            message: "Institution registered successfully",
            tenant,
            user
        });
    } catch (err) {
        console.error("Tenant registration error:", err);
        res.status(500).json({ message: "Failed to register institution" });
    }
};

module.exports = {
    createRoomTag,
    getRoomTags,
    assignTagToVenue,
    getVenueTags,
    deleteVenueTag,
    upsertAccommodation,
    getAccommodation,
    createCalendarEvent,
    getCalendarEvents,
    updateCalendarEvent,
    deleteCalendarEvent,
    getNotifications,
    getUnreadNotifications,
    markAsRead,
    getAuditLogs,
    getAuditLogsByEntity,
    getAuditLogsByUser,
    getTenantSettings,
    updateTenantSettings,
    registerTenant
};
