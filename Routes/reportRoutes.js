const { Router } = require("express");
const {
    getLecturerWorkload,
    getRoomUtilization,
    getStudentTimetableReport,
    getExamUtilization,
    getConflictsReport
} = require("../controllers/reportController");
const authMiddleware = require("../middleware/authMiddleware");
const tenantMiddleware = require("../middleware/tenantMiddleware");
const isAdmin = require("../middleware/UserAdmin");

const router = Router();

router.get("/lecturer-workload", authMiddleware, tenantMiddleware, isAdmin, getLecturerWorkload);
router.get("/room-utilization", authMiddleware, tenantMiddleware, isAdmin, getRoomUtilization);
router.get("/student-timetable", authMiddleware, tenantMiddleware, isAdmin, getStudentTimetableReport);
router.get("/exam-utilization", authMiddleware, tenantMiddleware, isAdmin, getExamUtilization);
router.get("/conflicts", authMiddleware, tenantMiddleware, isAdmin, getConflictsReport);

module.exports = router;
