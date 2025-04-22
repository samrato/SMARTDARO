
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
        return res.status(500).json({message:"Failed to fetch venues "})
        
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
        return  res.status(500).json({message:"Failed to fetch the venue "})
    }
};

// Add a new venue (Admin only)
const addVenueController = async (req, res, next) => {
    try {
        const { name, capacity, location, isAvailable } = req.body;

        if (!name || !capacity) {
            return res.status(422).json({message:"All fields are required"})
        }

        const newVenue = await venueService.addVenue({ name, capacity, location, isAvailable });
        res.status(201).json({ status: 'success', venue: newVenue });
    } catch (error) {
        console.error("Error adding venue:", error);
        return res.status(500).json({message:"Failed to add venue "})
    }
};

// Update venue details (Admin only)
const updateVenueController = async (req, res, next) => {
    try {
        const { venueId } = req.params;
        const { name, capacity, location, isAvailable } = req.body;

        const updatedVenue = await venueService.updateVenue(venueId, { name, capacity, location, isAvailable });

        if (!updatedVenue) {
            return res.status(404).json({message:"Venue not found"})
        }

        res.json({ status: 'success', venue: updatedVenue });
    } catch (error) {
        console.error("Error updating venue:", error);
        return res.status(500).json({message:"Failed to update venue"})
        
    }
};

// Delete venue (Admin only)
const deleteVenueController = async (req, res, next) => {
    try {
        const { venueId } = req.params;
        const deletedVenue = await venueService.deleteVenue(venueId);

        if (!deletedVenue) {
            return res.status(404).json({message:"Venue not found"})
        }

        res.json({ status: 'success', message: 'Venue deleted successfully' });
    } catch (error) {
        console.error("Error deleting venue:", error);
        return res.status(500).json({message:"Internl server error"})
        
    }
};

module.exports = {
    getAllVenuesController,
    getVenueByIdController,
    addVenueController,
    updateVenueController,
    deleteVenueController
};
