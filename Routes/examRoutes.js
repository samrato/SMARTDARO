const { Router } = require("express");
const {
    createExamController,
    getExamByIdController,
    updateExamController,
    deleteExamController,
    createSupplementaryExamController,
    createDeferredExamController,
    getExamsController,
    allocateRoomController,
    getExamAllocationsController,
    assignInvigilatorController,
    getInvigilatorsController,
    scheduleExamsAIController,
    generateSeatingPlanController,
    getSeatingPlanController,
    updateSeatAssignmentController
} = require("../controllers/examController");
const isAdmin = require("../middleware/UserAdmin");
const authMiddleware = require("../middleware/authMiddleware");
const tenantMiddleware = require("../middleware/tenantMiddleware");
const featureGuard = require("../middleware/featureGuard");

const router = Router();

router.use(authMiddleware, tenantMiddleware, featureGuard);

router.post("/", authMiddleware, tenantMiddleware, isAdmin, createExamController);
router.get("/", authMiddleware, tenantMiddleware, getExamsController);
router.post("/schedule-ai", authMiddleware, tenantMiddleware, isAdmin, scheduleExamsAIController);

router.post("/supplementary", authMiddleware, tenantMiddleware, isAdmin, createSupplementaryExamController);
router.post("/deferred", authMiddleware, tenantMiddleware, isAdmin, createDeferredExamController);

router.get("/:id", authMiddleware, tenantMiddleware, getExamByIdController);
router.put("/:id", authMiddleware, tenantMiddleware, isAdmin, updateExamController);
router.delete("/:id", authMiddleware, tenantMiddleware, isAdmin, deleteExamController);

router.post("/allocate-room", authMiddleware, tenantMiddleware, isAdmin, allocateRoomController);
router.get("/allocations/:examId", authMiddleware, tenantMiddleware, getExamAllocationsController);

router.post("/assign-invigilator", authMiddleware, tenantMiddleware, isAdmin, assignInvigilatorController);
router.get("/invigilators/:examAllocationId", authMiddleware, tenantMiddleware, getInvigilatorsController);

router.post("/:id/generate-seating-plan", authMiddleware, tenantMiddleware, isAdmin, generateSeatingPlanController);
router.get("/:id/seating-plan", authMiddleware, tenantMiddleware, getSeatingPlanController);
router.put("/seating-plans/:seatId", authMiddleware, tenantMiddleware, isAdmin, updateSeatAssignmentController);

module.exports = router;
