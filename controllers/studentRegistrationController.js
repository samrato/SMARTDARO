const db = require('../database/pgDb');

const registerStudent = async (req, res, next) => {
    const { studentId, unitId, sessionId } = req.body;
    const tenantId = req.tenantId;

    if (!studentId || !unitId || !sessionId) {
        return res.status(422).json({ message: "All fields are required" });
    }

    try {
        const queryText = `
            INSERT INTO student_registrations (tenant_id, student_id, unit_id, session_id, registration_status)
            VALUES ($1, $2, $3, $4, 'REGISTERED')
            ON CONFLICT (tenant_id, student_id, unit_id, session_id)
            DO UPDATE SET
                registration_status = 'REGISTERED'
            RETURNING *
        `;
        const values = [tenantId, studentId, unitId, sessionId];
        const result = await db.query(queryText, values);

        res.status(201).json({ status: "success", registration: result.rows[0] });
    } catch (error) {
        console.error("Error registering student for unit:", error);
        res.status(500).json({ message: "Failed to register student for unit" });
    }
};

const dropRegistration = async (req, res, next) => {
    const { studentId, unitId, sessionId } = req.body;
    const tenantId = req.tenantId;

    if (!studentId || !unitId || !sessionId) {
        return res.status(422).json({ message: "All fields are required" });
    }

    try {
        const queryText = `
            UPDATE student_registrations
            SET registration_status = 'DROPPED'
            WHERE tenant_id = $1 AND student_id = $2 AND unit_id = $3 AND session_id = $4
            RETURNING *
        `;
        const values = [tenantId, studentId, unitId, sessionId];
        const result = await db.query(queryText, values);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Registration not found" });
        }

        res.json({ status: "success", registration: result.rows[0] });
    } catch (error) {
        console.error("Error dropping student registration:", error);
        res.status(500).json({ message: "Failed to drop registration" });
    }
};

const getStudentRegistrations = async (req, res, next) => {
    const { studentId, sessionId } = req.params;
    const tenantId = req.tenantId;

    try {
        const result = await db.query(
            'SELECT * FROM student_registrations WHERE tenant_id = $1 AND student_id = $2 AND session_id = $3',
            [tenantId, studentId, sessionId]
        );
        res.json({ status: "success", registrations: result.rows });
    } catch (error) {
        console.error("Error fetching student registrations:", error);
        res.status(500).json({ message: "Failed to fetch student registrations" });
    }
};

module.exports = {
    registerStudent,
    dropRegistration,
    getStudentRegistrations
};
