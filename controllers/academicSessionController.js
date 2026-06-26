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

const getAcademicSessionById = async (req, res, next) => {
    const { id } = req.params;
    const tenantId = req.tenantId;

    try {
        const result = await db.query(
            'SELECT * FROM academic_sessions WHERE id = $1 AND tenant_id = $2',
            [id, tenantId]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Academic session not found" });
        }
        res.json({ status: "success", session: result.rows[0] });
    } catch (error) {
        console.error("Error fetching academic session by ID:", error);
        res.status(500).json({ message: "Failed to fetch academic session" });
    }
};

const updateAcademicSession = async (req, res, next) => {
    const { id } = req.params;
    const { yearLabel, termLabel, startDate, endDate, isActive } = req.body;
    const tenantId = req.tenantId;

    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');

        if (isActive) {
            await client.query(
                'UPDATE academic_sessions SET is_active = FALSE WHERE tenant_id = $1',
                [tenantId]
            );
        }

        const result = await client.query(
            `UPDATE academic_sessions 
             SET year_label = COALESCE($1, year_label),
                 term_label = COALESCE($2, term_label),
                 start_date = COALESCE($3, start_date),
                 end_date = COALESCE($4, end_date),
                 is_active = COALESCE($5, is_active)
             WHERE id = $6 AND tenant_id = $7 RETURNING *`,
            [yearLabel, termLabel, startDate, endDate, isActive, id, tenantId]
        );

        if (result.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: "Academic session not found" });
        }

        await client.query('COMMIT');
        res.json({ status: "success", session: result.rows[0] });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error("Error updating academic session:", error);
        res.status(500).json({ message: "Failed to update academic session" });
    } finally {
        client.release();
    }
};

const deleteAcademicSession = async (req, res, next) => {
    const { id } = req.params;
    const tenantId = req.tenantId;

    try {
        const result = await db.query(
            'DELETE FROM academic_sessions WHERE id = $1 AND tenant_id = $2 RETURNING id',
            [id, tenantId]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Academic session not found" });
        }
        res.json({ status: "success", message: "Academic session deleted successfully" });
    } catch (error) {
        console.error("Error deleting academic session:", error);
        res.status(500).json({ message: "Failed to delete academic session" });
    }
};

const getActiveAcademicSession = async (req, res, next) => {
    const tenantId = req.tenantId;

    try {
        const result = await db.query(
            'SELECT * FROM academic_sessions WHERE tenant_id = $1 AND is_active = TRUE LIMIT 1',
            [tenantId]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "No active academic session found" });
        }
        res.json({ status: "success", session: result.rows[0] });
    } catch (error) {
        console.error("Error fetching active academic session:", error);
        res.status(500).json({ message: "Failed to fetch active academic session" });
    }
};

module.exports = {
    createAcademicSession,
    getAcademicSessions,
    getAcademicSessionById,
    updateAcademicSession,
    deleteAcademicSession,
    getActiveAcademicSession
};
