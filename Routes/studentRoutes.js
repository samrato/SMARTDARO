const { Router } = require("express");
const {
    getStudentTimetableController,
    getStudentCurrentTimetableController
} = require("../controllers/timetableController");
const authMiddleware = require("../middleware/authMiddleware");
const tenantMiddleware = require("../middleware/tenantMiddleware");

const router = Router();

router.get("/:id/timetable", authMiddleware, tenantMiddleware, getStudentTimetableController);
router.get("/:id/timetable/current", authMiddleware, tenantMiddleware, getStudentCurrentTimetableController);
router.get("/:id/timetable/session/:sessionId", authMiddleware, tenantMiddleware, getStudentTimetableController);

module.exports = router;
