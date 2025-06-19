const { Router } = require("express");
const { registerUser, loginUser, getUser, updateUser } = require("../controllers/userController");
const {
    getAllVenuesController,
    getVenueByIdController,
    addVenueController,
    updateVenueController,
    deleteVenueController,
} = require("../controllers/venueCotroller"); // 
const {
    getAllCoursesController,
    getCourseByIdController,
    addCourseController,
    updateCourseController,
    deleteCourseController
} = require("../controllers/courseController");
const {
    allocateTimetableAIController,
    getTimetableByDayController,
    getTimetableByIdController,
    deleteTimetableController
} = require("../controllers/timetableController");
const isAdmin = require("../middleware/UserAdmin");
const authMiddleware=require("../middleware/authMiddleware")



const {
    addLecturer,
    getAllLecturers,
    getLecturerById,
    deleteLecturer,
  } = require("../controllers/lecturerController");

const router = Router();

// ============= User Authentication Routes =============
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/:userId",authMiddleware, getUser);
router.put("/:userId", authMiddleware,updateUser);

// ============= Venue Routes (Fixed Conflicts) =============
router.get('/venues', authMiddleware,getAllVenuesController);
router.get('/venues/:venueId',authMiddleware, getVenueByIdController);
// Admin routes (protected)
router.post('/venues',authMiddleware, isAdmin, addVenueController);
router.put('/venues/:venueId',authMiddleware, isAdmin, updateVenueController);
router.delete('/venues/:venueId', authMiddleware,isAdmin, deleteVenueController);

// ============= Course Routes (Fixed Conflicts) =============

router.get("/course", authMiddleware,getAllCoursesController);
router.get("/course/:courseId/", authMiddleware,getCourseByIdController);
// Admin routes (protected)
router.post("/add/course/", authMiddleware,isAdmin, addCourseController);
router.put("/add/:courseId",authMiddleware, isAdmin, updateCourseController);
router.delete("/add/:courseId",authMiddleware, isAdmin, deleteCourseController);


// ============= Course Routes (Fixed Conflicts) =============
router.get("/:day",authMiddleware, getTimetableByDayController);
router.get("/id/:id", authMiddleware,getTimetableByIdController);
// Admin routes (protected)
router.post("/allocate-ai", authMiddleware,isAdmin, allocateTimetableAIController);
router.delete("/:id",authMiddleware, isAdmin, deleteTimetableController);

// ============= Lecture  Routes (Fixed Conflicts) =============
router.post("/lec", authMiddleware, isAdmin, addLecturer);
router.get("/lec", authMiddleware, getAllLecturers);
router.get("/lec/:id", authMiddleware, getLecturerById);
router.delete("/lec/:id", authMiddleware, isAdmin, deleteLecturer);


module.exports = router;
