const { Router } = require("express");
const {
    registerStudent,
    dropRegistration,
    getStudentRegistrations,
    getAllRegistrations,
    getRegistrationsByStudent,
    deleteRegistration
} = require("../controllers/studentRegistrationController");
const authMiddleware = require("../middleware/authMiddleware");
const tenantMiddleware = require("../middleware/tenantMiddleware");
const isAdmin = require("../middleware/UserAdmin");

const router = Router();

router.post("/", authMiddleware, tenantMiddleware, registerStudent);
router.get("/", authMiddleware, tenantMiddleware, getAllRegistrations);
router.put("/drop", authMiddleware, tenantMiddleware, dropRegistration);
router.get("/student/:studentId", authMiddleware, tenantMiddleware, getRegistrationsByStudent);
router.get("/:studentId", authMiddleware, tenantMiddleware, getRegistrationsByStudent);
router.get("/:studentId/:sessionId", authMiddleware, tenantMiddleware, getStudentRegistrations);
router.delete("/:id", authMiddleware, tenantMiddleware, isAdmin, deleteRegistration);

module.exports = router;
