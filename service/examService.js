const db = require('../database/pgDb');

class ExamService {
    async createExam({ tenantId, academicSessionId, courseId, type, examDate, startTime, endTime }) {
        // Enforce that course exists
        const courseRes = await db.query('SELECT id FROM courses WHERE id = $1 AND tenant_id = $2', [courseId, tenantId]);
        if (courseRes.rows.length === 0) {
            throw new Error("Course not found in this tenant");
        }

        const result = await db.query(
            `INSERT INTO exams (tenant_id, academic_session_id, course_id, type, exam_date, start_time, end_time)
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [tenantId, academicSessionId, courseId, type, examDate, startTime, endTime]
        );
        return result.rows[0];
    }

    async getExams(tenantId, academicSessionId) {
        let query = 'SELECT e.*, c.name as "courseName", c.code as "courseCode" FROM exams e JOIN courses c ON e.course_id = c.id WHERE e.tenant_id = $1';
        const params = [tenantId];
        if (academicSessionId) {
            query += ' AND e.academic_session_id = $2';
            params.push(academicSessionId);
        }
        query += ' ORDER BY e.exam_date ASC, e.start_time ASC';
        const result = await db.query(query, params);
        return result.rows;
    }

    async allocateExamRoom({ tenantId, examId, roomId, seatingCapacity }) {
        // 1. Fetch exam details
        const examRes = await db.query('SELECT * FROM exams WHERE id = $1 AND tenant_id = $2', [examId, tenantId]);
        if (examRes.rows.length === 0) {
            throw new Error("Exam not found");
        }
        const exam = examRes.rows[0];

        // 2. Fetch room details
        const roomRes = await db.query('SELECT capacity FROM rooms WHERE id = $1 AND tenant_id = $2', [roomId, tenantId]);
        if (roomRes.rows.length === 0) {
            throw new Error("Room not found");
        }
        const room = roomRes.rows[0];

        // 3. Verify capacity
        if (seatingCapacity > room.capacity) {
            throw new Error(`Seating capacity (${seatingCapacity}) exceeds room capacity (${room.capacity})`);
        }

        // 4. Verify room collision: is this room already allocated to another exam at the same date and overlapping time?
        const clashRes = await db.query(
            `SELECT ea.id FROM exam_allocations ea
             JOIN exams e ON ea.exam_id = e.id
             WHERE ea.room_id = $1 AND ea.tenant_id = $2 AND e.exam_date = $3
             AND NOT (e.end_time <= $4 OR e.start_time >= $5)`,
            [roomId, tenantId, exam.exam_date, exam.start_time, exam.end_time]
        );

        if (clashRes.rows.length > 0) {
            throw new Error("Room conflict: Room is already allocated to another exam at this date and time");
        }

        const result = await db.query(
            `INSERT INTO exam_allocations (tenant_id, exam_id, room_id, seating_capacity)
             VALUES ($1, $2, $3, $4) RETURNING *`,
            [tenantId, examId, roomId, seatingCapacity]
        );
        return result.rows[0];
    }

    async getExamAllocations(tenantId, examId) {
        const result = await db.query(
            `SELECT ea.*, r.name as "roomName", r.location as "roomLocation"
             FROM exam_allocations ea
             JOIN rooms r ON ea.room_id = r.id
             WHERE ea.tenant_id = $1 AND ea.exam_id = $2`,
            [tenantId, examId]
        );
        return result.rows;
    }

    async assignInvigilator({ tenantId, examAllocationId, invigilatorId }) {
        // 1. Verify allocation
        const allocRes = await db.query(
            `SELECT ea.exam_id, e.exam_date, e.start_time, e.end_time
             FROM exam_allocations ea
             JOIN exams e ON ea.exam_id = e.id
             WHERE ea.id = $1 AND ea.tenant_id = $2`,
            [examAllocationId, tenantId]
        );
        if (allocRes.rows.length === 0) {
            throw new Error("Exam allocation not found");
        }
        const alloc = allocRes.rows[0];

        // 2. Verify invigilator role
        const userRes = await db.query('SELECT role FROM users WHERE id = $1 AND tenant_id = $2', [invigilatorId, tenantId]);
        if (userRes.rows.length === 0) {
            throw new Error("Invigilator user not found");
        }
        if (userRes.rows[0].role !== 'instructor' && userRes.rows[0].role !== 'admin') {
            throw new Error("Invigilator must be an instructor or admin");
        }

        // 3. Verify invigilator clash: is this lecturer already assigned to an exam at this date and overlapping time?
        const clashRes = await db.query(
            `SELECT ia.id FROM invigilator_allocations ia
             JOIN exam_allocations ea ON ia.exam_allocation_id = ea.id
             JOIN exams e ON ea.exam_id = e.id
             WHERE ia.invigilator_id = $1 AND ia.tenant_id = $2 AND e.exam_date = $3
             AND NOT (e.end_time <= $4 OR e.start_time >= $5)`,
            [invigilatorId, tenantId, alloc.exam_date, alloc.start_time, alloc.end_time]
        );

        if (clashRes.rows.length > 0) {
            throw new Error("Invigilator conflict: Lecturer is already assigned to another exam at this date and time");
        }

        const result = await db.query(
            `INSERT INTO invigilator_allocations (tenant_id, exam_allocation_id, invigilator_id)
             VALUES ($1, $2, $3) RETURNING *`,
            [tenantId, examAllocationId, invigilatorId]
        );
        return result.rows[0];
    }

    async getInvigilatorsForAllocation(tenantId, examAllocationId) {
        const result = await db.query(
            `SELECT ia.*, u.full_name as "invigilatorName", u.email as "invigilatorEmail"
             FROM invigilator_allocations ia
             JOIN users u ON ia.invigilator_id = u.id
             WHERE ia.tenant_id = $1 AND ia.exam_allocation_id = $2`,
            [tenantId, examAllocationId]
        );
        return result.rows;
    }
}

module.exports = new ExamService();
