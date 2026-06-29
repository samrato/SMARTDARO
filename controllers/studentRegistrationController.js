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

const getAllRegistrations = async (req, res, next) => {
    const tenantId = req.tenantId;

    try {
        const result = await db.query(`
            SELECT 
              sr.id,
              sr.student_id,
              u.full_name AS student_name,
              u.reg_number AS student_reg_number,
              sr.unit_id,
              un.name AS unit_name,
              un.code AS unit_code,
              sr.session_id,
              s.year_label AS session_year,
              s.term_label AS session_term,
              sr.registration_status,
              sr.created_at
            FROM student_registrations sr
            LEFT JOIN users u ON sr.student_id = u.id::text
            LEFT JOIN units un ON sr.unit_id = un.id::text
            LEFT JOIN academic_sessions s ON sr.session_id = s.id
            WHERE sr.tenant_id = $1
            ORDER BY sr.created_at DESC
        `, [tenantId]);
        res.json({ status: "success", registrations: result.rows });
    } catch (error) {
        console.error("Error fetching registrations:", error);
        res.status(500).json({ message: "Failed to fetch registrations" });
    }
};

const getRegistrationsByStudent = async (req, res, next) => {
    const { studentId } = req.params;
    const tenantId = req.tenantId;

    try {
        const userRes = await db.query(
            `SELECT id FROM users 
             WHERE tenant_id = $1 AND (id::text = $2 OR LOWER(reg_number) = LOWER($2))`,
            [tenantId, studentId]
        );
        let resolvedStudentId = studentId;
        if (userRes.rows.length > 0) {
            resolvedStudentId = userRes.rows[0].id;
        }

        const result = await db.query(`
            SELECT 
              sr.id,
              sr.student_id,
              u.full_name AS student_name,
              u.reg_number AS student_reg_number,
              sr.unit_id,
              un.name AS unit_name,
              un.code AS unit_code,
              sr.session_id,
              s.year_label AS session_year,
              s.term_label AS session_term,
              sr.registration_status,
              sr.created_at
            FROM student_registrations sr
            LEFT JOIN users u ON sr.student_id = u.id::text
            LEFT JOIN units un ON sr.unit_id = un.id::text
            LEFT JOIN academic_sessions s ON sr.session_id = s.id
            WHERE sr.tenant_id = $1 AND sr.student_id = $2
            ORDER BY sr.created_at DESC
        `, [tenantId, resolvedStudentId]);
        res.json({ status: "success", registrations: result.rows });
    } catch (error) {
        console.error("Error fetching registrations for student:", error);
        res.status(500).json({ message: "Failed to fetch registrations" });
    }
};

const deleteRegistration = async (req, res, next) => {
    const { id } = req.params;
    const tenantId = req.tenantId;

    try {
        const result = await db.query(
            'DELETE FROM student_registrations WHERE id = $1 AND tenant_id = $2 RETURNING id',
            [id, tenantId]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Registration not found" });
        }
        res.json({ status: "success", message: "Registration deleted successfully" });
    } catch (error) {
        console.error("Error deleting registration:", error);
        res.status(500).json({ message: "Failed to delete registration" });
    }
};

module.exports = {
    registerStudent,
    dropRegistration,
    getStudentRegistrations,
    getAllRegistrations,
    getRegistrationsByStudent,
    deleteRegistration
};
