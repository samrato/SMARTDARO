const { Router } = require("express");
const {
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
} = require("../controllers/enterpriseController");
const isAdmin = require("../middleware/UserAdmin");
const authMiddleware = require("../middleware/authMiddleware");
const tenantMiddleware = require("../middleware/tenantMiddleware");

const router = Router();

// Room suitability / tags
router.post("/room-tags", authMiddleware, tenantMiddleware, isAdmin, createRoomTag);
router.get("/room-tags", authMiddleware, tenantMiddleware, getRoomTags);
router.post("/venues/:id/tags", authMiddleware, tenantMiddleware, isAdmin, assignTagToVenue);
router.get("/venues/:id/tags", authMiddleware, tenantMiddleware, getVenueTags);
router.delete("/venues/:id/tags/:tagId", authMiddleware, tenantMiddleware, isAdmin, deleteVenueTag);

// Student accommodations
router.post("/student-accommodations", authMiddleware, tenantMiddleware, isAdmin, upsertAccommodation);
router.get("/student-accommodations/:studentId", authMiddleware, tenantMiddleware, getAccommodation);

// Academic calendar
router.post("/academic-calendar/events", authMiddleware, tenantMiddleware, isAdmin, createCalendarEvent);
router.get("/academic-calendar/events", authMiddleware, tenantMiddleware, getCalendarEvents);
router.put("/academic-calendar/events/:id", authMiddleware, tenantMiddleware, isAdmin, updateCalendarEvent);
router.delete("/academic-calendar/events/:id", authMiddleware, tenantMiddleware, isAdmin, deleteCalendarEvent);

// Notifications
router.get("/notifications", authMiddleware, tenantMiddleware, getNotifications);
router.get("/notifications/unread", authMiddleware, tenantMiddleware, getUnreadNotifications);
router.put("/notifications/:id/read", authMiddleware, tenantMiddleware, markAsRead);

// Audit logs
router.get("/audit-logs", authMiddleware, tenantMiddleware, isAdmin, getAuditLogs);
router.get("/audit-logs/entity/:entityId", authMiddleware, tenantMiddleware, isAdmin, getAuditLogsByEntity);
router.get("/audit-logs/user/:userId", authMiddleware, tenantMiddleware, isAdmin, getAuditLogsByUser);

// Tenant settings
router.get("/settings", authMiddleware, tenantMiddleware, getTenantSettings);
router.put("/settings", authMiddleware, tenantMiddleware, isAdmin, updateTenantSettings);

// Public tenant registration wizard
router.post("/register-tenant", registerTenant);

module.exports = router;
