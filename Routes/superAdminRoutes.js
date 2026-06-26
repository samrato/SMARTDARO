const { Router } = require("express");
const {
    getTenants,
    updateTenantStatus,
    getPlatformStats,
    deleteTenant,
    getPlatformStaff,
    createPlatformStaff,
    deletePlatformStaff
} = require("../controllers/superAdminController");
const authMiddleware = require("../middleware/authMiddleware");
const isSuperAdmin = require("../middleware/superAdminMiddleware");

const router = Router();

// Apply auth and super admin validation to all super-admin endpoints
router.use(authMiddleware, isSuperAdmin);

router.get("/stats", getPlatformStats);
router.get("/tenants", getTenants);
router.put("/tenants/:tenantId/status", updateTenantStatus);
router.delete("/tenants/:tenantId", deleteTenant);

router.get("/staff", getPlatformStaff);
router.post("/staff", createPlatformStaff);
router.delete("/staff/:id", deletePlatformStaff);

module.exports = router;
