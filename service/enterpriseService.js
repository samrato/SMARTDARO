const db = require('../database/pgDb');

class EnterpriseService {
    // Room Suitability & Tags
    async createRoomTag({ tenantId, tagName }) {
        const result = await db.query(
            `INSERT INTO room_tags (tenant_id, tag_name)
             VALUES ($1, $2) ON CONFLICT (tenant_id, tag_name) DO UPDATE SET tag_name = EXCLUDED.tag_name RETURNING *`,
            [tenantId, tagName.toUpperCase()]
        );
        return result.rows[0];
    }

    async getRoomTags(tenantId) {
        const result = await db.query('SELECT * FROM room_tags WHERE tenant_id = $1 ORDER BY tag_name ASC', [tenantId]);
        return result.rows;
    }

    async assignTagToVenue({ tenantId, venueId, tagId }) {
        const result = await db.query(
            `INSERT INTO venue_tags (tenant_id, venue_id, tag_id)
             VALUES ($1, $2, $3) ON CONFLICT DO NOTHING RETURNING *`,
            [tenantId, venueId, tagId]
        );
        return result.rows[0];
    }

    async getVenueTags(tenantId, venueId) {
        const result = await db.query(
            `SELECT vt.*, rt.tag_name FROM venue_tags vt
             JOIN room_tags rt ON vt.tag_id = rt.id
             WHERE vt.tenant_id = $1 AND vt.venue_id = $2`,
            [tenantId, venueId]
        );
        return result.rows;
    }

    async deleteVenueTag(tenantId, venueId, tagId) {
        return await db.query(
            'DELETE FROM venue_tags WHERE tenant_id = $1 AND venue_id = $2 AND tag_id = $3',
            [tenantId, venueId, tagId]
        );
    }

    // Student Accommodations
    async upsertAccommodation({ tenantId, studentId, accommodationType, extraTimeRatio }) {
        const result = await db.query(
            `INSERT INTO student_accommodations (student_id, tenant_id, accommodation_type, extra_time_ratio)
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (student_id)
             DO UPDATE SET
                 accommodation_type = EXCLUDED.accommodation_type,
                 extra_time_ratio = EXCLUDED.extra_time_ratio
             RETURNING *`,
            [studentId, tenantId, accommodationType, extraTimeRatio || 1.0]
        );
        return result.rows[0];
    }

    async getAccommodation(tenantId, studentId) {
        const result = await db.query(
            'SELECT * FROM student_accommodations WHERE tenant_id = $1 AND student_id = $2',
            [tenantId, studentId]
        );
        return result.rows[0];
    }

    // Academic Calendar
    async createCalendarEvent({ tenantId, title, eventDate, description }) {
        const result = await db.query(
            `INSERT INTO academic_calendar_events (tenant_id, title, event_date, description)
             VALUES ($1, $2, $3, $4) RETURNING *`,
            [tenantId, title, eventDate, description]
        );
        return result.rows[0];
    }

    async getCalendarEvents(tenantId) {
        const result = await db.query(
            'SELECT * FROM academic_calendar_events WHERE tenant_id = $1 ORDER BY event_date ASC',
            [tenantId]
        );
        return result.rows;
    }

    async updateCalendarEvent(id, tenantId, { title, eventDate, description }) {
        const result = await db.query(
            `UPDATE academic_calendar_events 
             SET title = COALESCE($1, title), event_date = COALESCE($2, event_date), description = COALESCE($3, description)
             WHERE id = $4 AND tenant_id = $5 RETURNING *`,
            [title, eventDate, description, id, tenantId]
        );
        return result.rows[0];
    }

    async deleteCalendarEvent(id, tenantId) {
        return await db.query('DELETE FROM academic_calendar_events WHERE id = $1 AND tenant_id = $2', [id, tenantId]);
    }

    // Notifications
    async getNotifications(tenantId, userId) {
        const result = await db.query(
            'SELECT * FROM notifications WHERE tenant_id = $1 AND user_id = $2 ORDER BY created_at DESC',
            [tenantId, userId]
        );
        return result.rows;
    }

    async getUnreadNotifications(tenantId, userId) {
        const result = await db.query(
            'SELECT * FROM notifications WHERE tenant_id = $1 AND user_id = $2 AND is_read = FALSE ORDER BY created_at DESC',
            [tenantId, userId]
        );
        return result.rows;
    }

    async markAsRead(id, tenantId, userId) {
        const result = await db.query(
            'UPDATE notifications SET is_read = TRUE WHERE id = $1 AND tenant_id = $2 AND user_id = $3 RETURNING *',
            [id, tenantId, userId]
        );
        return result.rows[0];
    }

    // Audit Logs
    async getAuditLogs(tenantId) {
        const result = await db.query(
            'SELECT al.*, u.full_name as "userName" FROM audit_logs al LEFT JOIN users u ON al.user_id = u.id WHERE al.tenant_id = $1 ORDER BY al.created_at DESC LIMIT 200',
            [tenantId]
        );
        return result.rows;
    }

    async getAuditLogsByEntity(tenantId, entityId) {
        const result = await db.query(
            'SELECT al.*, u.full_name as "userName" FROM audit_logs al LEFT JOIN users u ON al.user_id = u.id WHERE al.tenant_id = $1 AND al.entity_id = $2 ORDER BY al.created_at DESC',
            [tenantId, entityId]
        );
        return result.rows;
    }

    async getAuditLogsByUser(tenantId, userId) {
        const result = await db.query(
            'SELECT al.*, u.full_name as "userName" FROM audit_logs al LEFT JOIN users u ON al.user_id = u.id WHERE al.tenant_id = $1 AND al.user_id = $2 ORDER BY al.created_at DESC',
            [tenantId, userId]
        );
        return result.rows;
    }
}

module.exports = new EnterpriseService();
