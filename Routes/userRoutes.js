const { Router } = require("express");
const { registerUser, loginUser, getUser, updateUser } = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/:userId", authMiddleware, getUser);
router.put("/:userId", authMiddleware, updateUser);

module.exports = router;
