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


router.get("/", authMiddleware,getAllCoursesController);
router.get("/:courseId", authMiddleware,getCourseByIdController);
// Admin routes (protected)
router.post("/", authMiddleware,isAdmin, addCourseController);
router.put("/:courseId",authMiddleware, isAdmin, updateCourseController);
router.delete("/:courseId",authMiddleware, isAdmin, deleteCourseController);


// ============= Course Routes (Fixed Conflicts) =============
router.get("/:day",authMiddleware, getTimetableByDayController);
router.get("/id/:id", authMiddleware,getTimetableByIdController);
// Admin routes (protected)
router.post("/allocate-ai", authMiddleware,isAdmin, allocateTimetableAIController);
router.delete("/:id",authMiddleware, isAdmin, deleteTimetableController);





module.exports = router;
