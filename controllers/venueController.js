const HttpError = require('../models/errorModel');
const venueService = require('../service/venueService');
const cache = require('../service/redisService');

// Get all venues (Accessible to everyone)
const getAllVenuesController = async (req, res, next) => {
    try {
        const tenantId = req.tenantId;
        const cacheKey = `venues:${tenantId}:all`;
        const cached = await cache.getCache(cacheKey);
        if (cached) {
            return res.json({ status: 'success', venues: cached, source: "cache" });
        }

        const venues = await venueService.getAllVenues(tenantId);
        await cache.setCache(cacheKey, venues, 300); // 5 min TTL
        res.json({ status: 'success', venues });
    } catch (error) {
        console.error("Error fetching venues:", error);
        return res.status(500).json({ message: "Failed to fetch venues " });
    }
};

// Get venue by ID (Accessible to everyone)
const getVenueByIdController = async (req, res, next) => {
    try {
        const { venueId } = req.params;
        const tenantId = req.tenantId;
        const cacheKey = `venues:${tenantId}:id:${venueId}`;
        const cached = await cache.getCache(cacheKey);
        if (cached) {
            return res.json({ status: 'success', venue: cached, source: "cache" });
        }

        const venue = await venueService.getVenueById(venueId, tenantId);
        await cache.setCache(cacheKey, venue, 300);
        res.json({ status: 'success', venue });
    } catch (error) {
        console.error("Error fetching venue:", error);
        return res.status(500).json({ message: "Failed to fetch the venue " });
    }
};

// Add a new venue (Admin only)
const addVenueController = async (req, res, next) => {
    try {
        const { name, capacity, location, isAvailable } = req.body;
        const tenantId = req.tenantId;

        if (!name || !capacity) {
            return res.status(422).json({ message: "All fields are required" });
        }

        const newVenue = await venueService.addVenue({ tenantId, name, capacity, location, isAvailable });
        await cache.clearPattern(`venues:${tenantId}:*`);
        res.status(201).json({ status: 'success', venue: newVenue });
    } catch (error) {
        console.error("Error adding venue:", error);
        return res.status(500).json({ message: "Failed to add venue " });
    }
};

// Update venue details (Admin only)
const updateVenueController = async (req, res, next) => {
    try {
        const { venueId } = req.params;
        const { name, capacity, location, isAvailable } = req.body;
        const tenantId = req.tenantId;

        const updatedVenue = await venueService.updateVenue(venueId, tenantId, { name, capacity, location, isAvailable });

        if (!updatedVenue) {
            return res.status(404).json({ message: "Venue not found" });
        }

        await cache.clearPattern(`venues:${tenantId}:*`);
        res.json({ status: 'success', venue: updatedVenue });
    } catch (error) {
        console.error("Error updating venue:", error);
        return res.status(500).json({ message: "Failed to update venue" });
    }
};

// Delete venue (Admin only)
const deleteVenueController = async (req, res, next) => {
    try {
        const { venueId } = req.params;
        const tenantId = req.tenantId;
        const deletedVenue = await venueService.deleteVenue(venueId, tenantId);

        if (!deletedVenue) {
            return res.status(404).json({ message: "Venue not found" });
        }

        await cache.clearPattern(`venues:${tenantId}:*`);
        res.json({ status: 'success', message: 'Venue deleted successfully' });
    } catch (error) {
        console.error("Error deleting venue:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

const createRoomTagController = async (req, res, next) => {
    try {
        const { tagName } = req.body;
        const tenantId = req.tenantId;

        if (!tagName) {
            return res.status(422).json({ message: "tagName is required" });
        }

        const tag = await venueService.createRoomTag({ tenantId, tagName });
        res.status(201).json({ status: 'success', tag });
    } catch (error) {
        console.error("Error creating room tag:", error);
        return res.status(500).json({ message: "Failed to create room tag" });
    }
};

const getRoomTagsController = async (req, res, next) => {
    try {
        const tenantId = req.tenantId;
        const tags = await venueService.getRoomTags(tenantId);
        res.json({ status: 'success', tags });
    } catch (error) {
        console.error("Error fetching room tags:", error);
        return res.status(500).json({ message: "Failed to fetch room tags" });
    }
};

const addVenueTagController = async (req, res, next) => {
    try {
        const { id } = req.params; // venue id
        const { tagId } = req.body;
        const tenantId = req.tenantId;

        if (!tagId) {
            return res.status(422).json({ message: "tagId is required" });
        }

        const relation = await venueService.addVenueTag({ tenantId, venueId: id, tagId });
        res.status(201).json({ status: 'success', relation });
    } catch (error) {
        console.error("Error adding venue tag:", error);
        return res.status(500).json({ message: "Failed to add venue tag" });
    }
};

const getVenueTagsController = async (req, res, next) => {
    try {
        const { id } = req.params; // venue id
        const tenantId = req.tenantId;
        const tags = await venueService.getVenueTags(id, tenantId);
        res.json({ status: 'success', tags });
    } catch (error) {
        console.error("Error fetching venue tags:", error);
        return res.status(500).json({ message: "Failed to fetch venue tags" });
    }
};

const deleteVenueTagController = async (req, res, next) => {
    try {
        const { id, tagId } = req.params;
        const tenantId = req.tenantId;
        const deleted = await venueService.deleteVenueTag({ tenantId, venueId: id, tagId });

        if (!deleted) {
            return res.status(404).json({ message: "Venue tag relation not found" });
        }

        res.json({ status: 'success', message: 'Venue tag removed successfully' });
    } catch (error) {
        console.error("Error deleting venue tag:", error);
        return res.status(500).json({ message: "Failed to delete venue tag" });
    }
};

module.exports = {
    getAllVenuesController,
    getVenueByIdController,
    addVenueController,
    updateVenueController,
    deleteVenueController,
    createRoomTagController,
    getRoomTagsController,
    addVenueTagController,
    getVenueTagsController,
    deleteVenueTagController
};
