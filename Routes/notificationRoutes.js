const { Router } = require("express");
const {
    getNotifications,
    getUnreadNotifications,
    markAsRead
} = require("../controllers/enterpriseController");
const authMiddleware = require("../middleware/authMiddleware");
const tenantMiddleware = require("../middleware/tenantMiddleware");

const router = Router();

router.get("/", authMiddleware, tenantMiddleware, getNotifications);
router.get("/unread", authMiddleware, tenantMiddleware, getUnreadNotifications);
router.put("/:id/read", authMiddleware, tenantMiddleware, markAsRead);

module.exports = router;
