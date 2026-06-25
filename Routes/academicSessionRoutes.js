const { Router } = require("express");
const { createAcademicSession, getAcademicSessions } = require("../controllers/academicSessionController");
const authMiddleware = require("../middleware/authMiddleware");
const tenantMiddleware = require("../middleware/tenantMiddleware");
const isAdmin = require("../middleware/UserAdmin");

const router = Router();

router.post("/", authMiddleware, tenantMiddleware, isAdmin, createAcademicSession);
router.get("/", authMiddleware, tenantMiddleware, getAcademicSessions);

module.exports = router;
