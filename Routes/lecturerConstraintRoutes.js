const { Router } = require("express");
const { upsertLecturerConstraints, getLecturerConstraints } = require("../controllers/lecturerConstraintController");
const authMiddleware = require("../middleware/authMiddleware");
const tenantMiddleware = require("../middleware/tenantMiddleware");
const isAdmin = require("../middleware/UserAdmin");

const router = Router();

router.post("/", authMiddleware, tenantMiddleware, upsertLecturerConstraints);
router.get("/:lecturerId", authMiddleware, tenantMiddleware, getLecturerConstraints);

module.exports = router;
