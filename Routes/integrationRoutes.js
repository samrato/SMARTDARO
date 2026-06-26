const { Router } = require("express");
const {
    connectMoodle,
    connectCanvas,
    syncMoodle,
    syncCanvas
} = require("../controllers/integrationController");
const authMiddleware = require("../middleware/authMiddleware");
const tenantMiddleware = require("../middleware/tenantMiddleware");
const isAdmin = require("../middleware/UserAdmin");
const featureGuard = require("../middleware/featureGuard");

const router = Router();

router.use(authMiddleware, tenantMiddleware, featureGuard);

router.post("/moodle/connect", authMiddleware, tenantMiddleware, isAdmin, connectMoodle);
router.post("/canvas/connect", authMiddleware, tenantMiddleware, isAdmin, connectCanvas);
router.post("/moodle/sync", authMiddleware, tenantMiddleware, isAdmin, syncMoodle);
router.post("/canvas/sync", authMiddleware, tenantMiddleware, isAdmin, syncCanvas);

module.exports = router;
