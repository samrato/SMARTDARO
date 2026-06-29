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

const canViewReports = (req, res, next) => {
    if (!req.user || (!req.user.isAdmin && req.user.role !== 'faculty_officer')) {
        return res.status(403).json({ status: 'error', message: 'Access denied, admin or faculty admin only' });
    }
    next();
};

const router = Router();

router.get("/lecturer-workload", authMiddleware, tenantMiddleware, canViewReports, getLecturerWorkload);
router.get("/room-utilization", authMiddleware, tenantMiddleware, canViewReports, getRoomUtilization);
router.get("/student-timetable", authMiddleware, tenantMiddleware, canViewReports, getStudentTimetableReport);
router.get("/exam-utilization", authMiddleware, tenantMiddleware, canViewReports, getExamUtilization);
router.get("/conflicts", authMiddleware, tenantMiddleware, canViewReports, getConflictsReport);

module.exports = router;
