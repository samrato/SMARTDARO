const { Router } = require("express");
const { upsertAccommodation, getAccommodation } = require("../controllers/enterpriseController");
const isAdmin = require("../middleware/UserAdmin");
const authMiddleware = require("../middleware/authMiddleware");
const tenantMiddleware = require("../middleware/tenantMiddleware");

const router = Router();

router.post("/", authMiddleware, tenantMiddleware, isAdmin, upsertAccommodation);
router.get("/:studentId", authMiddleware, tenantMiddleware, getAccommodation);
router.put("/:studentId", authMiddleware, tenantMiddleware, isAdmin, upsertAccommodation);

module.exports = router;
