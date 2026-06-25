const db = require('../database/pgDb');

// Get all venues
const getAllVenues = async () => {
    try {
        const result = await db.query('SELECT id, name, capacity, location, is_available as "isAvailable" FROM rooms');
        return result.rows;
    } catch (error) {
        throw new Error('Failed to fetch venues');
    }
};

// Get venue by ID
const getVenueById = async (venueId) => {
    try {
        const result = await db.query('SELECT id, name, capacity, location, is_available as "isAvailable" FROM rooms WHERE id = $1', [venueId]);
        if (result.rows.length === 0) throw new Error('Venue not found');
        return result.rows[0];
    } catch (error) {
        throw new Error('Failed to fetch venue');
    }
};

// Create a new venue
const addVenue = async (venueData) => {
    try {
        const tenantId = '550e8400-e29b-41d4-a716-446655440000'; // Default Tenant
        const result = await db.query(
            `INSERT INTO rooms (tenant_id, name, capacity, location, is_available)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING id, name, capacity, location, is_available as "isAvailable"`,
            [tenantId, venueData.name, venueData.capacity, venueData.location || null, venueData.isAvailable !== false]
        );
        return result.rows[0];
    } catch (error) {
        throw new Error('Failed to create venue');
    }
};

// Update venue details
const updateVenue = async (venueId, updates) => {
    try {
        const fields = [];
        const values = [];
        let idx = 1;
        for (const [key, val] of Object.entries(updates)) {
            if (key === 'isAvailable') {
                fields.push(`is_available = $${idx}`);
                values.push(val);
            } else if (['name', 'capacity', 'location'].includes(key)) {
                fields.push(`${key} = $${idx}`);
                values.push(val);
            }
            idx++;
        }
        if (fields.length === 0) throw new Error("No fields to update");
        values.push(venueId);
        const query = `UPDATE rooms SET ${fields.join(', ')} WHERE id = $${idx} RETURNING id, name, capacity, location, is_available as "isAvailable"`;
        const result = await db.query(query, values);
        if (result.rows.length === 0) throw new Error("Venue not found");
        return result.rows[0];
    } catch (error) {
        throw new Error('Failed to update venue');
    }
};

// Delete a venue
const deleteVenue = async (venueId) => {
    try {
        const result = await db.query('DELETE FROM rooms WHERE id = $1 RETURNING id', [venueId]);
        if (result.rows.length === 0) return null;
        return result.rows[0];
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
