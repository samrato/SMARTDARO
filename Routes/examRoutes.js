const { Router } = require("express");
const {
    createExamController,
    getExamsController,
    allocateRoomController,
    getExamAllocationsController,
    assignInvigilatorController,
    getInvigilatorsController
} = require("../controllers/examController");
const isAdmin = require("../middleware/UserAdmin");
const authMiddleware = require("../middleware/authMiddleware");
const tenantMiddleware = require("../middleware/tenantMiddleware");

const router = Router();

router.post("/", authMiddleware, tenantMiddleware, isAdmin, createExamController);
router.get("/", authMiddleware, tenantMiddleware, getExamsController);

router.post("/allocate-room", authMiddleware, tenantMiddleware, isAdmin, allocateRoomController);
router.get("/allocations/:examId", authMiddleware, tenantMiddleware, getExamAllocationsController);

router.post("/assign-invigilator", authMiddleware, tenantMiddleware, isAdmin, assignInvigilatorController);
router.get("/invigilators/:examAllocationId", authMiddleware, tenantMiddleware, getInvigilatorsController);

module.exports = router;
