const express = require("express");

const Venue = require('../models/venue');

// Get all venues
const getAllVenues = async () => {
    try {
        return await Venue.find();
    } catch (error) {
        throw new Error('Failed to fetch venues');
    }
};

// Get venue by ID
const getVenueById = async (venueId) => {
    try {
        const venue = await Venue.findById(venueId);
        if (!venue) throw new Error('Venue not found');
        return venue;
    } catch (error) {
        throw new Error('Failed to fetch venue');
    }
};

// Create a new venue
const addVenue = async (venueData) => {
    try {
        const newVenue = new Venue(venueData);
        await newVenue.save();
        return newVenue;
    } catch (error) {
        throw new Error('Failed to create venue');
    }
};

// Update venue details
const updateVenue = async (venueId, updates) => {
    try {
        return await Venue.findByIdAndUpdate(venueId, updates, { new: true });
    } catch (error) {
        throw new Error('Failed to update venue');
    }
};

// Delete a venue
const deleteVenue = async (venueId) => {
    try {
        return await Venue.findByIdAndDelete(venueId);
    } catch (error) {
        throw new Error('Failed to delete venue');
    }
};

module.exports = {
    getAllVenues,
    getVenueById,
    addVenue,
    updateVenue,
    deleteVenue
};
