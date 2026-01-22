const { Router } = require("express");
const {
    getAllCoursesController,
    getCourseByIdController,
    addCourseController,
    updateCourseController,
    deleteCourseController
} = require("../controllers/courseController");
const isAdmin = require("../middleware/UserAdmin");
const authMiddleware = require("../middleware/authMiddleware");

const router = Router();

router.get("/", authMiddleware, getAllCoursesController);
router.get("/:courseId", authMiddleware, getCourseByIdController);
router.post("/", authMiddleware, isAdmin, addCourseController);
router.put("/:courseId", authMiddleware, isAdmin, updateCourseController);
router.delete("/:courseId", authMiddleware, isAdmin, deleteCourseController);

module.exports = router;
