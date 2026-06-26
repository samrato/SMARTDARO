const { Router } = require("express");
const {
    createCourseStream,
    getCourseStreams,
    getAllCourseStreams,
    getCourseStreamById,
    updateCourseStream,
    deleteCourseStream
} = require("../controllers/courseStreamController");
const authMiddleware = require("../middleware/authMiddleware");
const tenantMiddleware = require("../middleware/tenantMiddleware");
const isAdmin = require("../middleware/UserAdmin");

const router = Router();

router.post("/", authMiddleware, tenantMiddleware, isAdmin, createCourseStream);
router.get("/", authMiddleware, tenantMiddleware, getAllCourseStreams);
router.get("/session/:sessionId", authMiddleware, tenantMiddleware, getCourseStreams);
router.get("/:id", authMiddleware, tenantMiddleware, getCourseStreamById);
router.put("/:id", authMiddleware, tenantMiddleware, isAdmin, updateCourseStream);
router.delete("/:id", authMiddleware, tenantMiddleware, isAdmin, deleteCourseStream);

module.exports = router;
