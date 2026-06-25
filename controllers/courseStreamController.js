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

module.exports = {
    createCourseStream,
    getCourseStreams
};
