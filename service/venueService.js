const db = require('../database/pgDb');

// Get all venues
const getAllVenues = async (tenantId) => {
    try {
        const result = await db.query('SELECT id, name, capacity, location, is_available as "isAvailable" FROM rooms WHERE tenant_id = $1', [tenantId]);
        return result.rows;
    } catch (error) {
        throw new Error('Failed to fetch venues');
    }
};

// Get venue by ID
const getVenueById = async (venueId, tenantId) => {
    try {
        const result = await db.query('SELECT id, name, capacity, location, is_available as "isAvailable" FROM rooms WHERE id = $1 AND tenant_id = $2', [venueId, tenantId]);
        if (result.rows.length === 0) throw new Error('Venue not found');
        return result.rows[0];
    } catch (error) {
        throw new Error('Failed to fetch venue');
    }
};

// Create a new venue
const addVenue = async ({ tenantId, name, capacity, location, isAvailable }) => {
    try {
        const result = await db.query(
            `INSERT INTO rooms (tenant_id, name, capacity, location, is_available)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING id, name, capacity, location, is_available as "isAvailable"`,
            [tenantId, name, capacity, location || null, isAvailable !== false]
        );
        return result.rows[0];
    } catch (error) {
        throw new Error('Failed to create venue');
    }
};

// Update venue details
const updateVenue = async (venueId, tenantId, updates) => {
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
        values.push(tenantId);
        const query = `UPDATE rooms SET ${fields.join(', ')} WHERE id = $${idx} AND tenant_id = $${idx + 1} RETURNING id, name, capacity, location, is_available as "isAvailable"`;
        const result = await db.query(query, values);
        if (result.rows.length === 0) throw new Error("Venue not found");
        return result.rows[0];
    } catch (error) {
        throw new Error('Failed to update venue');
    }
};

// Delete a venue
const deleteVenue = async (venueId, tenantId) => {
    try {
        const result = await db.query('DELETE FROM rooms WHERE id = $1 AND tenant_id = $2 RETURNING id', [venueId, tenantId]);
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
