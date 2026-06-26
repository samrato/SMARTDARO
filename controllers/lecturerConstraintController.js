const db = require('../database/pgDb');

const upsertLecturerConstraints = async (req, res, next) => {
    const { lecturerId, preferredDays, preferredTimeSlots, unavailableDays, maxHoursPerWeek, maxClassesPerDay, homeCampus, travelBufferMinutes } = req.body;
    const tenantId = req.tenantId;

    const actualLecturerId = lecturerId || req.params.lecturerId;

    if (!actualLecturerId) {
        return res.status(422).json({ message: "Lecturer ID is required" });
    }

    try {
        const queryText = `
            INSERT INTO lecturer_constraints (
                tenant_id, lecturer_id, preferred_days, preferred_time_slots, unavailable_days, 
                max_hours_per_week, max_classes_per_day, home_campus, travel_buffer_minutes
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            ON CONFLICT (tenant_id, lecturer_id)
            DO UPDATE SET
                preferred_days = EXCLUDED.preferred_days,
                preferred_time_slots = EXCLUDED.preferred_time_slots,
                unavailable_days = EXCLUDED.unavailable_days,
                max_hours_per_week = EXCLUDED.max_hours_per_week,
                max_classes_per_day = EXCLUDED.max_classes_per_day,
                home_campus = EXCLUDED.home_campus,
                travel_buffer_minutes = EXCLUDED.travel_buffer_minutes
            RETURNING *
        `;
        const values = [
            tenantId, 
            actualLecturerId, 
            JSON.stringify(preferredDays || []), 
            JSON.stringify(preferredTimeSlots || []), 
            JSON.stringify(unavailableDays || []), 
            maxHoursPerWeek || 20, 
            maxClassesPerDay || 3, 
            homeCampus || '', 
            travelBufferMinutes || 30
        ];
        const result = await db.query(queryText, values);

        res.status(200).json({ status: "success", constraints: result.rows[0] });
    } catch (error) {
        console.error("Error upserting lecturer constraints:", error);
        res.status(500).json({ message: "Failed to save lecturer constraints" });
    }
};

const getLecturerConstraints = async (req, res, next) => {
    const { lecturerId } = req.params;
    const tenantId = req.tenantId;

    try {
        const result = await db.query(
            'SELECT * FROM lecturer_constraints WHERE tenant_id = $1 AND lecturer_id = $2',
            [tenantId, lecturerId]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "No constraints found for this lecturer" });
        }

        res.json({ status: "success", constraints: result.rows[0] });
    } catch (error) {
        console.error("Error fetching lecturer constraints:", error);
        res.status(500).json({ message: "Failed to fetch lecturer constraints" });
    }
};

const deleteLecturerConstraints = async (req, res, next) => {
    const { lecturerId } = req.params;
    const tenantId = req.tenantId;

    try {
        const result = await db.query(
            'DELETE FROM lecturer_constraints WHERE tenant_id = $1 AND lecturer_id = $2 RETURNING id',
            [tenantId, lecturerId]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "No constraints found for this lecturer" });
        }
        res.json({ status: "success", message: "Lecturer constraints deleted successfully" });
    } catch (error) {
        console.error("Error deleting lecturer constraints:", error);
        res.status(500).json({ message: "Failed to delete lecturer constraints" });
    }
};

module.exports = {
    upsertLecturerConstraints,
    getLecturerConstraints,
    deleteLecturerConstraints
};
