const { Router } = require("express");
const {
    getAllVenuesController,
    getVenueByIdController,
    addVenueController,
    updateVenueController,
    deleteVenueController,
} = require("../controllers/venueController");
const isAdmin = require("../middleware/UserAdmin");
const authMiddleware = require("../middleware/authMiddleware");
const tenantMiddleware = require("../middleware/tenantMiddleware");

const router = Router();

router.get('/', authMiddleware, tenantMiddleware, getAllVenuesController);
router.get('/:venueId', authMiddleware, tenantMiddleware, getVenueByIdController);
router.post('/', authMiddleware, tenantMiddleware, isAdmin, addVenueController);
router.put('/:venueId', authMiddleware, tenantMiddleware, isAdmin, updateVenueController);
router.delete('/:venueId', authMiddleware, tenantMiddleware, isAdmin, deleteVenueController);

module.exports = router;
