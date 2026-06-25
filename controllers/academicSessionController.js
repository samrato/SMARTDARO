const db = require('../database/pgDb');

const createAcademicSession = async (req, res, next) => {
    const { yearLabel, termLabel, startDate, endDate, isActive } = req.body;
    const tenantId = req.tenantId;

    if (!yearLabel || !termLabel || !startDate || !endDate) {
        return res.status(422).json({ message: "All fields are required" });
    }

    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');

        if (isActive) {
            await client.query(
                'UPDATE academic_sessions SET is_active = FALSE WHERE tenant_id = $1',
                [tenantId]
            );
        }

        const queryText = `
            INSERT INTO academic_sessions (tenant_id, year_label, term_label, start_date, end_date, is_active)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `;
        const values = [tenantId, yearLabel, termLabel, startDate, endDate, isActive || false];
        const result = await client.query(queryText, values);

        await client.query('COMMIT');
        res.status(201).json({ status: "success", session: result.rows[0] });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error("Error creating academic session:", error);
        res.status(500).json({ message: "Failed to create academic session" });
    } finally {
        client.release();
    }
};

const getAcademicSessions = async (req, res, next) => {
    const tenantId = req.tenantId;

    try {
        const result = await db.query(
            'SELECT * FROM academic_sessions WHERE tenant_id = $1 ORDER BY start_date DESC',
            [tenantId]
        );
        res.json({ status: "success", sessions: result.rows });
    } catch (error) {
        console.error("Error fetching academic sessions:", error);
        res.status(500).json({ message: "Failed to fetch academic sessions" });
    }
};

module.exports = {
    createAcademicSession,
    getAcademicSessions
};
