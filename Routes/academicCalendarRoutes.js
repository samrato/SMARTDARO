const { Router } = require("express");
const {
    createCalendarEvent,
    getCalendarEvents,
    updateCalendarEvent,
    deleteCalendarEvent
} = require("../controllers/enterpriseController");
const isAdmin = require("../middleware/UserAdmin");
const authMiddleware = require("../middleware/authMiddleware");
const tenantMiddleware = require("../middleware/tenantMiddleware");

const router = Router();

router.post("/events", authMiddleware, tenantMiddleware, isAdmin, createCalendarEvent);
router.get("/events", authMiddleware, tenantMiddleware, getCalendarEvents);
router.put("/events/:id", authMiddleware, tenantMiddleware, isAdmin, updateCalendarEvent);
router.delete("/events/:id", authMiddleware, tenantMiddleware, isAdmin, deleteCalendarEvent);

module.exports = router;
