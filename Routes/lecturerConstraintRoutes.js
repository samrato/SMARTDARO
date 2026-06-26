const { Router } = require("express");
const {
    upsertLecturerConstraints,
    getLecturerConstraints,
    deleteLecturerConstraints
} = require("../controllers/lecturerConstraintController");
const authMiddleware = require("../middleware/authMiddleware");
const tenantMiddleware = require("../middleware/tenantMiddleware");
const isAdmin = require("../middleware/UserAdmin");

const router = Router();

router.post("/", authMiddleware, tenantMiddleware, upsertLecturerConstraints);
router.get("/:lecturerId", authMiddleware, tenantMiddleware, getLecturerConstraints);
router.put("/:lecturerId", authMiddleware, tenantMiddleware, upsertLecturerConstraints);
router.delete("/:lecturerId", authMiddleware, tenantMiddleware, isAdmin, deleteLecturerConstraints);

module.exports = router;
