
const express = require("express");
const HttpError = require('../models/errorModel');
const venueService = require('../service/venuService');

// Get all venues (Accessible to everyone)
const getAllVenuesController = async (req, res, next) => {
    try {
        const venues = await venueService.getAllVenues();
        res.json({ status: 'success', venues });
    } catch (error) {
        console.error("Error fetching venues:", error);
        return next(new HttpError("Failed to fetch venues", 500));
    }
};

// Get venue by ID (Accessible to everyone)
const getVenueByIdController = async (req, res, next) => {
    try {
        const { venueId } = req.params;
        const venue = await venueService.getVenueById(venueId);
        res.json({ status: 'success', venue });
    } catch (error) {
        console.error("Error fetching venue:", error);
        return next(new HttpError(error.message || "Failed to fetch venue", 500));
    }
};

// Add a new venue (Admin only)
const addVenueController = async (req, res, next) => {
    try {
        const { name, capacity, location, isAvailable } = req.body;

        if (!name || !capacity) {
            return next(new HttpError("Fill in all required fields", 422));
        }

        const newVenue = await venueService.addVenue({ name, capacity, location, isAvailable });
        res.status(201).json({ status: 'success', venue: newVenue });
    } catch (error) {
        console.error("Error adding venue:", error);
        return next(new HttpError(error.message || "Failed to add venue", 500));
    }
};

// Update venue details (Admin only)
const updateVenueController = async (req, res, next) => {
    try {
        const { venueId } = req.params;
        const { name, capacity, location, isAvailable } = req.body;

        const updatedVenue = await venueService.updateVenue(venueId, { name, capacity, location, isAvailable });

        if (!updatedVenue) {
            return next(new HttpError("Venue not found", 404));
        }

        res.json({ status: 'success', venue: updatedVenue });
    } catch (error) {
        console.error("Error updating venue:", error);
        return next(new HttpError(error.message || "Failed to update venue", 500));
    }
};

// Delete venue (Admin only)
const deleteVenueController = async (req, res, next) => {
    try {
        const { venueId } = req.params;
        const deletedVenue = await venueService.deleteVenue(venueId);

        if (!deletedVenue) {
            return next(new HttpError("Venue not found", 404));
        }

        res.json({ status: 'success', message: 'Venue deleted successfully' });
    } catch (error) {
        console.error("Error deleting venue:", error);
        return next(new HttpError(error.message || "Failed to delete venue", 500));
    }
};

module.exports = {
    getAllVenuesController,
    getVenueByIdController,
    addVenueController,
    updateVenueController,
    deleteVenueController
};
