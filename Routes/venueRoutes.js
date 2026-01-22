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

const router = Router();

router.get('/', authMiddleware, getAllVenuesController);
router.get('/:venueId', authMiddleware, getVenueByIdController);
router.post('/', authMiddleware, isAdmin, addVenueController);
router.put('/:venueId', authMiddleware, isAdmin, updateVenueController);
router.delete('/:venueId', authMiddleware, isAdmin, deleteVenueController);

module.exports = router;
