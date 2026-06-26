const { Router } = require("express");
const {
    getTimetableVersionsController,
    getTimetableVersionByIdController,
    restoreTimetableVersionController
} = require("../controllers/timetableController");
const isAdmin = require("../middleware/UserAdmin");
const authMiddleware = require("../middleware/authMiddleware");
const tenantMiddleware = require("../middleware/tenantMiddleware");

const router = Router();

router.get("/", authMiddleware, tenantMiddleware, getTimetableVersionsController);
router.get("/:id", authMiddleware, tenantMiddleware, getTimetableVersionByIdController);
router.post("/:id/restore", authMiddleware, tenantMiddleware, isAdmin, restoreTimetableVersionController);

module.exports = router;
