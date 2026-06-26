const { Router } = require("express");
const { updateSeatAssignmentController } = require("../controllers/examController");
const isAdmin = require("../middleware/UserAdmin");
const authMiddleware = require("../middleware/authMiddleware");
const tenantMiddleware = require("../middleware/tenantMiddleware");

const router = Router();

router.put("/:seatId", authMiddleware, tenantMiddleware, isAdmin, updateSeatAssignmentController);

module.exports = router;
