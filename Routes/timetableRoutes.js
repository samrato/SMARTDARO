const { Router } = require("express");
const {
    allocateTimetableAIController,
    getTimetableByDayController,
    getTimetableByIdController,
    deleteTimetableController,
    getUserTimetableController
} = require("../controllers/timetableController");
const isAdmin = require("../middleware/UserAdmin");
const authMiddleware = require("../middleware/authMiddleware");

const router = Router();

router.get("/my-timetable", authMiddleware, getUserTimetableController); // New route
router.get("/:day", authMiddleware, getTimetableByDayController);
router.get("/id/:id", authMiddleware, getTimetableByIdController);
router.post("/allocate-ai", authMiddleware, isAdmin, allocateTimetableAIController);
router.delete("/:id", authMiddleware, isAdmin, deleteTimetableController);

module.exports = router;
