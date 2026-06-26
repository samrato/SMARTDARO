const { Router } = require("express");
const {
    createFaculty,
    getFaculties,
    createDepartment,
    getDepartments,
    createUnit,
    getUnits,
    createCampus,
    getCampuses
} = require("../controllers/academicCatalogController");
const isAdmin = require("../middleware/UserAdmin");
const authMiddleware = require("../middleware/authMiddleware");
const tenantMiddleware = require("../middleware/tenantMiddleware");
const featureGuard = require("../middleware/featureGuard");

const router = Router();

// Faculties
router.post("/faculties", authMiddleware, tenantMiddleware, featureGuard, isAdmin, createFaculty);
router.get("/faculties", authMiddleware, tenantMiddleware, featureGuard, getFaculties);

// Departments
router.post("/departments", authMiddleware, tenantMiddleware, featureGuard, isAdmin, createDepartment);
router.get("/departments", authMiddleware, tenantMiddleware, featureGuard, getDepartments);

// Units
router.post("/units", authMiddleware, tenantMiddleware, isAdmin, createUnit);
router.get("/units", authMiddleware, tenantMiddleware, getUnits);

// Campuses
router.post("/campuses", authMiddleware, tenantMiddleware, isAdmin, createCampus);
router.get("/campuses", authMiddleware, tenantMiddleware, getCampuses);

module.exports = router;
