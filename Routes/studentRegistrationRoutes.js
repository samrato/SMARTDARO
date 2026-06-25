const { Router } = require("express");
const { registerStudent, dropRegistration, getStudentRegistrations } = require("../controllers/studentRegistrationController");
const authMiddleware = require("../middleware/authMiddleware");
const tenantMiddleware = require("../middleware/tenantMiddleware");

const router = Router();

router.post("/", authMiddleware, tenantMiddleware, registerStudent);
router.put("/drop", authMiddleware, tenantMiddleware, dropRegistration);
router.get("/:studentId/:sessionId", authMiddleware, tenantMiddleware, getStudentRegistrations);

module.exports = router;
