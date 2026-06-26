const { Router } = require("express");
const {
    getLecturerTimetableController,
    getLecturerCurrentTimetableController
} = require("../controllers/timetableController");
const authMiddleware = require("../middleware/authMiddleware");
const tenantMiddleware = require("../middleware/tenantMiddleware");

const router = Router();

router.get("/:id/timetable", authMiddleware, tenantMiddleware, getLecturerTimetableController);
router.get("/:id/timetable/current", authMiddleware, tenantMiddleware, getLecturerCurrentTimetableController);

module.exports = router;
