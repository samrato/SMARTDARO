const { Router } = require("express");
const {
    allocateTimetableAIController,
    publishTimetableController,
    lockTimetableController,
    getTimetableByDayController,
    getTimetableByIdController,
    deleteTimetableController,
    getUserTimetableController
} = require("../controllers/timetableController");
const isAdmin = require("../middleware/UserAdmin");
const authMiddleware = require("../middleware/authMiddleware");
const tenantMiddleware = require("../middleware/tenantMiddleware");

const router = Router();

router.get("/my-timetable", authMiddleware, getUserTimetableController);
router.get("/:day", authMiddleware, tenantMiddleware, getTimetableByDayController);
router.get("/id/:id", authMiddleware, tenantMiddleware, getTimetableByIdController);
router.post("/allocate-ai", authMiddleware, tenantMiddleware, isAdmin, allocateTimetableAIController);
router.put("/publish/:sessionId", authMiddleware, tenantMiddleware, isAdmin, publishTimetableController);
router.put("/lock/:allocationId", authMiddleware, tenantMiddleware, isAdmin, lockTimetableController);
router.delete("/:id", authMiddleware, tenantMiddleware, isAdmin, deleteTimetableController);

module.exports = router;
