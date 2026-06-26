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

    async getExamById(id, tenantId) {
        const result = await db.query(
            'SELECT e.*, c.name as "courseName", c.code as "courseCode" FROM exams e JOIN courses c ON e.course_id = c.id WHERE e.id = $1 AND e.tenant_id = $2',
            [id, tenantId]
        );
        return result.rows[0];
    }

    async updateExam(id, tenantId, { examDate, startTime, endTime, type }) {
        const result = await db.query(
            `UPDATE exams 
             SET exam_date = COALESCE($1, exam_date),
                 start_time = COALESCE($2, start_time),
                 end_time = COALESCE($3, end_time),
                 type = COALESCE($4, type)
             WHERE id = $5 AND tenant_id = $6 RETURNING *`,
            [examDate, startTime, endTime, type, id, tenantId]
        );
        return result.rows[0];
    }

    async deleteExam(id, tenantId) {
        return await db.query('DELETE FROM exams WHERE id = $1 AND tenant_id = $2', [id, tenantId]);
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

    // AI Exam Scheduling Solver
    async scheduleExamsAI({ tenantId, academicSessionId }) {
        const examsRes = await db.query('SELECT * FROM exams WHERE tenant_id = $1 AND academic_session_id = $2', [tenantId, academicSessionId]);
        const exams = examsRes.rows;

        const roomsRes = await db.query('SELECT * FROM rooms WHERE tenant_id = $1 AND is_available = TRUE', [tenantId]);
        const rooms = roomsRes.rows;

        const instructorsRes = await db.query("SELECT id FROM users WHERE tenant_id = $1 AND role = 'instructor'", [tenantId]);
        const instructors = instructorsRes.rows;

        if (exams.length === 0) throw new Error("No exams found to schedule");
        if (rooms.length === 0) throw new Error("No available rooms found");
        if (instructors.length === 0) throw new Error("No available invigilators found");

        const allocations = [];

        // Clear existing allocations
        for (const exam of exams) {
            await db.query('DELETE FROM exam_allocations WHERE exam_id = $1 AND tenant_id = $2', [exam.id, tenantId]);
        }

        for (const exam of exams) {
            let allocated = false;
            for (const room of rooms) {
                if (allocated) break;

                const roomClash = allocations.some(a => 
                    a.roomId === room.id &&
                    a.examDate === exam.exam_date &&
                    !(a.endTime <= exam.start_time || a.startTime >= exam.end_time)
                );
                if (roomClash) continue;

                let selectedInvigilator = null;
                for (const inst of instructors) {
                    const invClash = allocations.some(a => 
                        a.invigilatorId === inst.id &&
                        a.examDate === exam.exam_date &&
                        !(a.endTime <= exam.start_time || a.startTime >= exam.end_time)
                    );
                    if (!invClash) {
                        selectedInvigilator = inst.id;
                        break;
                    }
                }
                if (!selectedInvigilator) continue;

                const allocRes = await db.query(
                    `INSERT INTO exam_allocations (tenant_id, exam_id, room_id, seating_capacity)
                     VALUES ($1, $2, $3, $4) RETURNING *`,
                    [tenantId, exam.id, room.id, room.capacity]
                );
                const allocation = allocRes.rows[0];

                await db.query(
                    `INSERT INTO invigilator_allocations (tenant_id, exam_allocation_id, invigilator_id)
                     VALUES ($1, $2, $3)`,
                    [tenantId, allocation.id, selectedInvigilator]
                );

                allocations.push({
                    examId: exam.id,
                    roomId: room.id,
                    invigilatorId: selectedInvigilator,
                    examDate: exam.exam_date,
                    startTime: exam.start_time,
                    endTime: exam.end_time
                });
                allocated = true;
                break;
            }
            if (!allocated) {
                throw new Error(`Failed to allocate resources for exam ${exam.id} due to conflicts.`);
            }
        }
        return allocations;
    }

    // Seating Plans
    async generateSeatingPlan({ tenantId, examId }) {
        const examRes = await db.query('SELECT course_id FROM exams WHERE id = $1 AND tenant_id = $2', [examId, tenantId]);
        if (examRes.rows.length === 0) throw new Error("Exam not found");
        const courseId = examRes.rows[0].course_id;

        const studentsRes = await db.query(
            "SELECT student_id FROM student_registrations WHERE unit_id = $1 AND tenant_id = $2 AND registration_status = 'REGISTERED'",
            [courseId, tenantId]
        );
        const students = studentsRes.rows.map(r => r.student_id);
        if (students.length === 0) throw new Error("No students registered for this exam's course");

        const allocsRes = await db.query('SELECT * FROM exam_allocations WHERE exam_id = $1 AND tenant_id = $2', [examId, tenantId]);
        const allocations = allocsRes.rows;
        if (allocations.length === 0) throw new Error("No rooms allocated for this exam");

        for (const alloc of allocations) {
            await db.query('DELETE FROM seating_plans WHERE exam_allocation_id = $1 AND tenant_id = $2', [alloc.id, tenantId]);
        }

        const seatingPlan = [];
        let studentIndex = 0;

        for (const alloc of allocations) {
            const seats = alloc.seating_capacity;
            for (let seatNum = 1; seatNum <= seats; seatNum++) {
                if (studentIndex >= students.length) break;

                const studentId = students[studentIndex];
                const seatLabel = `SEAT-${seatNum}`;

                const result = await db.query(
                    `INSERT INTO seating_plans (tenant_id, exam_allocation_id, student_id, seat_number)
                     VALUES ($1, $2, $3, $4) RETURNING *`,
                    [tenantId, alloc.id, studentId, seatLabel]
                );
                seatingPlan.push(result.rows[0]);
                studentIndex++;
            }
            if (studentIndex >= students.length) break;
        }

        if (studentIndex < students.length) {
            throw new Error(`Insufficient seating capacity! Allocated: ${studentIndex}, Required: ${students.length}`);
        }
        return seatingPlan;
    }

    async getSeatingPlan(tenantId, examId) {
        const result = await db.query(
            `SELECT sp.*, u.full_name as "studentName", u.email as "studentEmail", r.name as "roomName"
             FROM seating_plans sp
             JOIN exam_allocations ea ON sp.exam_allocation_id = ea.id
             JOIN rooms r ON ea.room_id = r.id
             JOIN users u ON sp.student_id = u.id
             WHERE sp.tenant_id = $1 AND ea.exam_id = $2`,
            [tenantId, examId]
        );
        return result.rows;
    }

    async updateSeatAssignment(seatId, tenantId, seatNumber) {
        const result = await db.query(
            'UPDATE seating_plans SET seat_number = $1 WHERE id = $2 AND tenant_id = $3 RETURNING *',
            [seatNumber, seatId, tenantId]
        );
        return result.rows[0];
    }
}

module.exports = new ExamService();
