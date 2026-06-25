const db = require("../database/pgDb");

// Retrieve all courses
const getAllCourses = async () => {
    try {
        const result = await db.query(`
            SELECT c.id, c.name, c.code, c.capacity, c.duration,
                   u.id as "inst_id", u.full_name as "inst_name", u.email as "inst_email"
            FROM courses c
            LEFT JOIN users u ON c.instructor_id = u.id
        `);
        return result.rows.map(row => ({
            id: row.id,
            name: row.name,
            code: row.code,
            capacity: row.capacity,
            duration: row.duration,
            instructor: row.inst_id ? {
                id: row.inst_id,
                fullName: row.inst_name,
                email: row.inst_email
            } : null,
            students: [] // Matches previous mongoose students populate contract
        }));
    } catch (error) {
        throw new Error("Error retrieving courses: " + error.message);
    }
};

// Retrieve a course by ID
const getCourseById = async (id) => {
    try {
        const result = await db.query(`
            SELECT c.id, c.name, c.code, c.capacity, c.duration,
                   u.id as "inst_id", u.full_name as "inst_name", u.email as "inst_email"
            FROM courses c
            LEFT JOIN users u ON c.instructor_id = u.id
            WHERE c.id = $1
        `, [id]);

        if (result.rows.length === 0) throw new Error("Course not found");
        const row = result.rows[0];
        return {
            id: row.id,
            name: row.name,
            code: row.code,
            capacity: row.capacity,
            duration: row.duration,
            instructor: row.inst_id ? {
                id: row.inst_id,
                fullName: row.inst_name,
                email: row.inst_email
            } : null,
            students: []
        };
    } catch (error) {
        throw new Error(error.message);
    }
};

// Add a new course
const createCourse = async ({ name, code, instructorId, capacity, duration }) => {
    try {
        const existing = await db.query('SELECT id FROM courses WHERE code = $1', [code]);
        if (existing.rows.length > 0) throw new Error("Course code already exists");

        const tenantId = '550e8400-e29b-41d4-a716-446655440000'; // Default Tenant

        const result = await db.query(`
            INSERT INTO courses (tenant_id, name, code, instructor_id, capacity, duration)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id, name, code, capacity, duration, instructor_id as "instructorId"
        `, [tenantId, name, code, instructorId || null, capacity || 40, duration || 2]);

        return result.rows[0];
    } catch (error) {
        throw new Error(error.message);
    }
};

// Update a course
const updateCourse = async (id, updatedData) => {
    try {
        const fields = [];
        const values = [];
        let idx = 1;
        for (const [key, val] of Object.entries(updatedData)) {
            if (key === 'instructorId' || key === 'instructor') {
                fields.push(`instructor_id = $${idx}`);
                values.push(val);
            } else if (['name', 'code', 'capacity', 'duration'].includes(key)) {
                fields.push(`${key} = $${idx}`);
                values.push(val);
            }
            idx++;
        }
        if (fields.length === 0) throw new Error("No fields to update");
        values.push(id);
        const query = `UPDATE courses SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`;
        const result = await db.query(query, values);
        if (result.rows.length === 0) throw new Error("Course not found");
        return result.rows[0];
    } catch (error) {
        throw new Error(error.message);
    }
};

// Delete a course
const deleteCourse = async (id) => {
    try {
        const result = await db.query('DELETE FROM courses WHERE id = $1 RETURNING id', [id]);
        if (result.rows.length === 0) throw new Error("Course not found");
        return { message: "Course deleted successfully" };
    } catch (error) {
        throw new Error(error.message);
    }
};

module.exports = {
    getAllCourses,
    getCourseById,
    createCourse,
    updateCourse,
    deleteCourse
};
