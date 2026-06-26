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

// Room Tags
const createRoomTag = async ({ tenantId, tagName }) => {
    try {
        const result = await db.query(
            `INSERT INTO room_tags (tenant_id, tag_name)
             VALUES ($1, $2)
             ON CONFLICT (tenant_id, tag_name) DO UPDATE SET tag_name = EXCLUDED.tag_name
             RETURNING id, tag_name as "tagName", created_at as "createdAt"`,
            [tenantId, tagName.toUpperCase()]
        );
        return result.rows[0];
    } catch (error) {
        throw new Error('Failed to create room tag');
    }
};

const getRoomTags = async (tenantId) => {
    try {
        const result = await db.query(
            `SELECT id, tag_name as "tagName", created_at as "createdAt"
             FROM room_tags
             WHERE tenant_id = $1 ORDER BY tag_name ASC`,
            [tenantId]
        );
        return result.rows;
    } catch (error) {
        throw new Error('Failed to fetch room tags');
    }
};

// Venue Tags
const addVenueTag = async ({ tenantId, venueId, tagId }) => {
    try {
        const result = await db.query(
            `INSERT INTO venue_tags (tenant_id, venue_id, tag_id)
             VALUES ($1, $2, $3)
             ON CONFLICT (tenant_id, venue_id, tag_id) DO UPDATE SET tag_id = EXCLUDED.tag_id
             RETURNING id, venue_id as "venueId", tag_id as "tagId", created_at as "createdAt"`,
            [tenantId, venueId, tagId]
        );
        return result.rows[0];
    } catch (error) {
        throw new Error('Failed to add venue tag');
    }
};

const getVenueTags = async (venueId, tenantId) => {
    try {
        const result = await db.query(
            `SELECT vt.id, vt.venue_id as "venueId", vt.tag_id as "tagId", rt.tag_name as "tagName", vt.created_at as "createdAt"
             FROM venue_tags vt
             JOIN room_tags rt ON vt.tag_id = rt.id
             WHERE vt.venue_id = $1 AND vt.tenant_id = $2`,
            [venueId, tenantId]
        );
        return result.rows;
    } catch (error) {
        throw new Error('Failed to fetch venue tags');
    }
};

const deleteVenueTag = async ({ tenantId, venueId, tagId }) => {
    try {
        const result = await db.query(
            `DELETE FROM venue_tags
             WHERE tenant_id = $1 AND venue_id = $2 AND tag_id = $3
             RETURNING id`,
            [tenantId, venueId, tagId]
        );
        if (result.rows.length === 0) return null;
        return result.rows[0];
    } catch (error) {
        throw new Error('Failed to delete venue tag');
    }
};

module.exports = {
    getAllVenues,
    getVenueById,
    addVenue,
    updateVenue,
    deleteVenue,
    createRoomTag,
    getRoomTags,
    addVenueTag,
    getVenueTags,
    deleteVenueTag
};
