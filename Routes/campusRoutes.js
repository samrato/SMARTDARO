const { Router } = require("express");
const {
    createCampus,
    getCampuses,
    getCampusById,
    updateCampus,
    deleteCampus
} = require("../controllers/academicCatalogController");
const isAdmin = require("../middleware/UserAdmin");
const authMiddleware = require("../middleware/authMiddleware");
const tenantMiddleware = require("../middleware/tenantMiddleware");

const router = Router();

router.post("/", authMiddleware, tenantMiddleware, isAdmin, createCampus);
router.get("/", authMiddleware, tenantMiddleware, getCampuses);
router.get("/:id", authMiddleware, tenantMiddleware, getCampusById);
router.put("/:id", authMiddleware, tenantMiddleware, isAdmin, updateCampus);
router.delete("/:id", authMiddleware, tenantMiddleware, isAdmin, deleteCampus);

module.exports = router;
