const { Router } = require("express");
const {
    createAcademicSession,
    getAcademicSessions,
    getAcademicSessionById,
    updateAcademicSession,
    deleteAcademicSession,
    getActiveAcademicSession
} = require("../controllers/academicSessionController");
const authMiddleware = require("../middleware/authMiddleware");
const tenantMiddleware = require("../middleware/tenantMiddleware");
const isAdmin = require("../middleware/UserAdmin");

const router = Router();

router.post("/", authMiddleware, tenantMiddleware, isAdmin, createAcademicSession);
router.get("/", authMiddleware, tenantMiddleware, getAcademicSessions);
router.get("/active", authMiddleware, tenantMiddleware, getActiveAcademicSession);
router.get("/:id", authMiddleware, tenantMiddleware, getAcademicSessionById);
router.put("/:id", authMiddleware, tenantMiddleware, isAdmin, updateAcademicSession);
router.delete("/:id", authMiddleware, tenantMiddleware, isAdmin, deleteAcademicSession);

module.exports = router;
