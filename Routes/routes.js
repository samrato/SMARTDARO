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
router.post('/venues', isAdmin, addVenueController);
router.put('/venues/:venueId', isAdmin, updateVenueController);
router.delete('/venues/:venueId', isAdmin, deleteVenueController);



// ============= Course Routes (Fixed Conflicts) =============


// Public routes
router.get("/", getAllCoursesController);
router.get("/:courseId", getCourseByIdController);

// Admin routes (protected)
router.post("/", isAdmin, addCourseController);
router.put("/:courseId", isAdmin, updateCourseController);
router.delete("/:courseId", isAdmin, deleteCourseController);



module.exports = router;
