const { Router } = require("express");
const {
    createRoomTagController,
    getRoomTagsController
} = require("../controllers/venueController");
const isAdmin = require("../middleware/UserAdmin");
const authMiddleware = require("../middleware/authMiddleware");
const tenantMiddleware = require("../middleware/tenantMiddleware");

const router = Router();

router.post("/", authMiddleware, tenantMiddleware, isAdmin, createRoomTagController);
router.get("/", authMiddleware, tenantMiddleware, getRoomTagsController);

module.exports = router;
