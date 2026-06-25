const { Router } = require("express");
const { createCourseStream, getCourseStreams } = require("../controllers/courseStreamController");
const authMiddleware = require("../middleware/authMiddleware");
const tenantMiddleware = require("../middleware/tenantMiddleware");
const isAdmin = require("../middleware/UserAdmin");

const router = Router();

router.post("/", authMiddleware, tenantMiddleware, isAdmin, createCourseStream);
router.get("/:sessionId", authMiddleware, tenantMiddleware, getCourseStreams);

module.exports = router;
