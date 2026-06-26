const { Router } = require("express");
const {
    getDepartmentTimetableController
} = require("../controllers/timetableController");
const authMiddleware = require("../middleware/authMiddleware");
const tenantMiddleware = require("../middleware/tenantMiddleware");

const router = Router();

router.get("/:id/timetable", authMiddleware, tenantMiddleware, getDepartmentTimetableController);

module.exports = router;
