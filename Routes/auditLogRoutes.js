const { Router } = require("express");
const {
    getAuditLogs,
    getAuditLogsByEntity,
    getAuditLogsByUser
} = require("../controllers/enterpriseController");
const isAdmin = require("../middleware/UserAdmin");
const authMiddleware = require("../middleware/authMiddleware");
const tenantMiddleware = require("../middleware/tenantMiddleware");

const router = Router();

router.get("/", authMiddleware, tenantMiddleware, isAdmin, getAuditLogs);
router.get("/entity/:entityId", authMiddleware, tenantMiddleware, isAdmin, getAuditLogsByEntity);
router.get("/user/:userId", authMiddleware, tenantMiddleware, isAdmin, getAuditLogsByUser);

module.exports = router;
