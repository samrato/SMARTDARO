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

const router = Router();

// ============= User Authentication Routes =============
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/:userId", getUser);
router.put("/:userId", updateUser);

// ============= Venue Routes (Fixed Conflicts) =============
router.get('/venues', getAllVenuesController);
router.get('/venues/:venueId', getVenueByIdController);
// Admin routes (protected)
router.post('/venues', isAdmin, addVenueController);
router.put('/venues/:venueId', isAdmin, updateVenueController);
router.delete('/venues/:venueId', isAdmin, deleteVenueController);



// ============= Course Routes (Fixed Conflicts) =============


router.get("/", getAllCoursesController);
router.get("/:courseId", getCourseByIdController);
// Admin routes (protected)
router.post("/", isAdmin, addCourseController);
router.put("/:courseId", isAdmin, updateCourseController);
router.delete("/:courseId", isAdmin, deleteCourseController);


// ============= Course Routes (Fixed Conflicts) =============
router.get("/:day", getTimetableByDayController);
router.get("/id/:id", getTimetableByIdController);
// Admin routes (protected)
router.post("/allocate-ai", isAdmin, allocateTimetableAIController);
router.delete("/:id", isAdmin, deleteTimetableController);





module.exports = router;
