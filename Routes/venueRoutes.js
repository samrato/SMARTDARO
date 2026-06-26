const { Router } = require("express");
const {
    getAllVenuesController,
    getVenueByIdController,
    addVenueController,
    updateVenueController,
    deleteVenueController,
    addVenueTagController,
    getVenueTagsController,
    deleteVenueTagController
} = require("../controllers/venueController");
const { getRoomTimetableController } = require("../controllers/timetableController");
const isAdmin = require("../middleware/UserAdmin");
const authMiddleware = require("../middleware/authMiddleware");
const tenantMiddleware = require("../middleware/tenantMiddleware");

const router = Router();

router.get('/', authMiddleware, tenantMiddleware, getAllVenuesController);
router.get('/:venueId', authMiddleware, tenantMiddleware, getVenueByIdController);
router.post('/', authMiddleware, tenantMiddleware, isAdmin, addVenueController);
router.put('/:venueId', authMiddleware, tenantMiddleware, isAdmin, updateVenueController);
router.delete('/:venueId', authMiddleware, tenantMiddleware, isAdmin, deleteVenueController);

// Venue Tags
router.post('/:id/tags', authMiddleware, tenantMiddleware, isAdmin, addVenueTagController);
router.get('/:id/tags', authMiddleware, tenantMiddleware, getVenueTagsController);
router.delete('/:id/tags/:tagId', authMiddleware, tenantMiddleware, isAdmin, deleteVenueTagController);

// Room Timetable
router.get('/:id/timetable', authMiddleware, tenantMiddleware, getRoomTimetableController);

module.exports = router;
