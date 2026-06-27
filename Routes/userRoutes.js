const { Router } = require("express");
const { registerUser, loginUser, getUser, updateUser, listUsers } = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");
const tenantMiddleware = require("../middleware/tenantMiddleware");

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/", authMiddleware, tenantMiddleware, listUsers);
router.get("/:userId", authMiddleware, getUser);
router.put("/:userId", authMiddleware, updateUser);

module.exports = router;
