const { Router } = require("express");
const {
    allocateTimetableAIController,
    publishTimetableController,
    unpublishTimetableController,
    getDraftTimetablesController,
    getPublishedTimetablesController,
    lockTimetableController,
    unlockTimetableController,
    getLockedTimetablesController,
    getTimetableByDayController,
    getTimetableByIdController,
    deleteTimetableController,
    getUserTimetableController,
    getTimetableVersionsController,
    getTimetableVersionByIdController,
    restoreTimetableVersionController,
    getStudentTimetableController,
    getLecturerTimetableController,
    getDepartmentTimetableController,
    getRoomTimetableController
} = require("../controllers/timetableController");
const isAdmin = require("../middleware/UserAdmin");
const authMiddleware = require("../middleware/authMiddleware");
const tenantMiddleware = require("../middleware/tenantMiddleware");

const router = Router();

router.get("/my-timetable", authMiddleware, getUserTimetableController);
router.get("/drafts", authMiddleware, tenantMiddleware, getDraftTimetablesController);
router.get("/published", authMiddleware, tenantMiddleware, getPublishedTimetablesController);
router.get("/locked", authMiddleware, tenantMiddleware, getLockedTimetablesController);
router.get("/versions", authMiddleware, tenantMiddleware, getTimetableVersionsController);
router.get("/versions/:id", authMiddleware, tenantMiddleware, getTimetableVersionByIdController);
router.post("/versions/:id/restore", authMiddleware, tenantMiddleware, isAdmin, restoreTimetableVersionController);

// REST scoped timetable views
router.get("/student/:id", authMiddleware, tenantMiddleware, getStudentTimetableController);
router.get("/student/:id/session/:sessionId", authMiddleware, tenantMiddleware, getStudentTimetableController);
router.get("/lecturer/:id", authMiddleware, tenantMiddleware, getLecturerTimetableController);
router.get("/department/:id", authMiddleware, tenantMiddleware, getDepartmentTimetableController);
router.get("/venue/:id", authMiddleware, tenantMiddleware, getRoomTimetableController);

router.get("/:day", authMiddleware, tenantMiddleware, getTimetableByDayController);
router.get("/id/:id", authMiddleware, tenantMiddleware, getTimetableByIdController);
router.post("/allocate-ai", authMiddleware, tenantMiddleware, isAdmin, allocateTimetableAIController);
router.put("/publish/:sessionId", authMiddleware, tenantMiddleware, isAdmin, publishTimetableController);
router.put("/unpublish/:sessionId", authMiddleware, tenantMiddleware, isAdmin, unpublishTimetableController);
router.put("/lock/:allocationId", authMiddleware, tenantMiddleware, isAdmin, lockTimetableController);
router.put("/unlock/:allocationId", authMiddleware, tenantMiddleware, isAdmin, unlockTimetableController);
router.delete("/:id", authMiddleware, tenantMiddleware, isAdmin, deleteTimetableController);

module.exports = router;
