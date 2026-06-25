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
const tenantMiddleware = require("../middleware/tenantMiddleware");

const router = Router();

router.get("/", authMiddleware, tenantMiddleware, getAllCoursesController);
router.get("/:courseId", authMiddleware, tenantMiddleware, getCourseByIdController);
router.post("/", authMiddleware, tenantMiddleware, isAdmin, addCourseController);
router.put("/:courseId", authMiddleware, tenantMiddleware, isAdmin, updateCourseController);
router.delete("/:courseId", authMiddleware, tenantMiddleware, isAdmin, deleteCourseController);

module.exports = router;
