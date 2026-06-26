const db = require('../database/pgDb');

const createCourseStream = async (req, res, next) => {
    const { courseId, academicSessionId, streamCode, streamName, capacity } = req.body;
    const tenantId = req.tenantId;

    if (!courseId || !academicSessionId || !streamCode || !streamName) {
        return res.status(422).json({ message: "All fields are required" });
    }

    try {
        const queryText = `
            INSERT INTO course_streams (tenant_id, course_id, academic_session_id, stream_code, stream_name, capacity)
            VALUES ($1, $2, $3, $4, $5, $6)
            ON CONFLICT (tenant_id, course_id, academic_session_id, stream_code)
            DO UPDATE SET
                stream_name = EXCLUDED.stream_name,
                capacity = EXCLUDED.capacity
            RETURNING *
        `;
        const values = [tenantId, courseId, academicSessionId, streamCode, streamName, capacity || 40];
        const result = await db.query(queryText, values);

        res.status(201).json({ status: "success", stream: result.rows[0] });
    } catch (error) {
        console.error("Error creating course stream:", error);
        res.status(500).json({ message: "Failed to create course stream" });
    }
};

const getCourseStreams = async (req, res, next) => {
    const { sessionId } = req.params;
    const tenantId = req.tenantId;

    try {
        const result = await db.query(
            'SELECT * FROM course_streams WHERE tenant_id = $1 AND academic_session_id = $2',
            [tenantId, sessionId]
        );
        res.json({ status: "success", streams: result.rows });
    } catch (error) {
        console.error("Error fetching course streams:", error);
        res.status(500).json({ message: "Failed to fetch course streams" });
    }
};

const getAllCourseStreams = async (req, res, next) => {
    const tenantId = req.tenantId;

    try {
        const result = await db.query(
            'SELECT * FROM course_streams WHERE tenant_id = $1 ORDER BY stream_name ASC',
            [tenantId]
        );
        res.json({ status: "success", streams: result.rows });
    } catch (error) {
        console.error("Error fetching course streams:", error);
        res.status(500).json({ message: "Failed to fetch course streams" });
    }
};

const getCourseStreamById = async (req, res, next) => {
    const { id } = req.params;
    const tenantId = req.tenantId;

    try {
        const result = await db.query(
            'SELECT * FROM course_streams WHERE id = $1 AND tenant_id = $2',
            [id, tenantId]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Course stream not found" });
        }
        res.json({ status: "success", stream: result.rows[0] });
    } catch (error) {
        console.error("Error fetching course stream by ID:", error);
        res.status(500).json({ message: "Failed to fetch course stream" });
    }
};

const updateCourseStream = async (req, res, next) => {
    const { id } = req.params;
    const { streamName, capacity } = req.body;
    const tenantId = req.tenantId;

    try {
        const result = await db.query(
            `UPDATE course_streams 
             SET stream_name = COALESCE($1, stream_name),
                 capacity = COALESCE($2, capacity)
             WHERE id = $3 AND tenant_id = $4 RETURNING *`,
            [streamName, capacity, id, tenantId]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Course stream not found" });
        }
        res.json({ status: "success", stream: result.rows[0] });
    } catch (error) {
        console.error("Error updating course stream:", error);
        res.status(500).json({ message: "Failed to update course stream" });
    }
};

const deleteCourseStream = async (req, res, next) => {
    const { id } = req.params;
    const tenantId = req.tenantId;

    try {
        const result = await db.query(
            'DELETE FROM course_streams WHERE id = $1 AND tenant_id = $2 RETURNING id',
            [id, tenantId]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Course stream not found" });
        }
        res.json({ status: "success", message: "Course stream deleted successfully" });
    } catch (error) {
        console.error("Error deleting course stream:", error);
        res.status(500).json({ message: "Failed to delete course stream" });
    }
};

module.exports = {
    createCourseStream,
    getCourseStreams,
    getAllCourseStreams,
    getCourseStreamById,
    updateCourseStream,
    deleteCourseStream
};
