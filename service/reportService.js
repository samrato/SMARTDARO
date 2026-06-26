const db = require('../database/pgDb');

class ReportService {
    async getLecturerWorkload(tenantId) {
        const query = `
            SELECT ta.lecturer_id as "lecturerId", u.full_name as "lecturerName", COALESCE(SUM(ta.end_time - ta.start_time), 0)::int as "totalHours"
            FROM timetable_allocations ta
            LEFT JOIN users u ON ta.lecturer_id = u.id::varchar
            WHERE ta.tenant_id = $1
            GROUP BY ta.lecturer_id, u.full_name
            ORDER BY "totalHours" DESC
        `;
        const result = await db.query(query, [tenantId]);
        return result.rows;
    }

    async getRoomUtilization(tenantId) {
        const query = `
            SELECT r.id as "roomId", r.name as "roomName", r.capacity, COALESCE(SUM(ta.end_time - ta.start_time), 0)::int as "occupiedHours"
            FROM rooms r
            LEFT JOIN timetable_allocations ta ON ta.room_id = r.id::varchar AND ta.tenant_id = r.tenant_id
            WHERE r.tenant_id = $1
            GROUP BY r.id, r.name, r.capacity
            ORDER BY "occupiedHours" DESC
        `;
        const result = await db.query(query, [tenantId]);
        return result.rows;
    }

    async getStudentTimetableReport(tenantId) {
        const query = `
            SELECT sr.student_id as "studentId", u.full_name as "studentName", ta.course_id as "courseId", c.name as "courseName", ta.day_of_week as "day", ta.start_time as "startTime", ta.end_time as "endTime"
            FROM student_registrations sr
            JOIN users u ON sr.student_id = u.id::varchar
            JOIN timetable_allocations ta ON sr.unit_id = ta.course_id AND sr.tenant_id = ta.tenant_id
            JOIN courses c ON ta.course_id::uuid = c.id
            WHERE sr.tenant_id = $1 AND sr.registration_status = 'REGISTERED'
            ORDER BY u.full_name ASC, ta.day_of_week ASC, ta.start_time ASC
        `;
        const result = await db.query(query, [tenantId]);
        return result.rows;
    }

    async getExamUtilization(tenantId) {
        const query = `
            SELECT e.id as "examId", c.name as "courseName", e.exam_date as "examDate", e.start_time as "startTime", e.end_time as "endTime",
                   ea.room_id as "roomId", r.name as "roomName", ea.seating_capacity as "seatingCapacity", r.capacity as "roomCapacity",
                   ROUND(COALESCE((ea.seating_capacity::float / NULLIF(r.capacity, 0) * 100), 0)::numeric, 2)::float as "utilizationPercentage"
            FROM exams e
            JOIN courses c ON e.course_id = c.id
            LEFT JOIN exam_allocations ea ON e.id = ea.exam_id AND e.tenant_id = ea.tenant_id
            LEFT JOIN rooms r ON ea.room_id = r.id
            WHERE e.tenant_id = $1
            ORDER BY e.exam_date ASC, e.start_time ASC
        `;
        const result = await db.query(query, [tenantId]);
        return result.rows;
    }

    async getConflictsReport(tenantId) {
        const lecturerConflictsQuery = `
            SELECT ta1.lecturer_id as "lecturerId", u.full_name as "lecturerName",
                   ta1.id as "allocationId1", ta1.course_id as "courseId1", c1.name as "courseName1",
                   ta2.id as "allocationId2", ta2.course_id as "courseId2", c2.name as "courseName2",
                   ta1.day_of_week as "day", ta1.start_time as "start1", ta1.end_time as "end1",
                   ta2.start_time as "start2", ta2.end_time as "end2"
            FROM timetable_allocations ta1
            JOIN timetable_allocations ta2 ON ta1.lecturer_id = ta2.lecturer_id AND ta1.day_of_week = ta2.day_of_week AND ta1.id < ta2.id AND ta1.tenant_id = ta2.tenant_id
            JOIN users u ON ta1.lecturer_id = u.id::varchar
            JOIN courses c1 ON ta1.course_id::uuid = c1.id
            JOIN courses c2 ON ta2.course_id::uuid = c2.id
            WHERE ta1.tenant_id = $1 AND ta1.start_time < ta2.end_time AND ta2.start_time < ta1.end_time
        `;
        const roomConflictsQuery = `
            SELECT ta1.room_id as "roomId", r.name as "roomName",
                   ta1.id as "allocationId1", ta1.course_id as "courseId1", c1.name as "courseName1",
                   ta2.id as "allocationId2", ta2.course_id as "courseId2", c2.name as "courseName2",
                   ta1.day_of_week as "day", ta1.start_time as "start1", ta1.end_time as "end1",
                   ta2.start_time as "start2", ta2.end_time as "end2"
            FROM timetable_allocations ta1
            JOIN timetable_allocations ta2 ON ta1.room_id = ta2.room_id AND ta1.day_of_week = ta2.day_of_week AND ta1.id < ta2.id AND ta1.tenant_id = ta2.tenant_id
            JOIN rooms r ON ta1.room_id::uuid = r.id
            JOIN courses c1 ON ta1.course_id::uuid = c1.id
            JOIN courses c2 ON ta2.course_id::uuid = c2.id
            WHERE ta1.tenant_id = $1 AND ta1.start_time < ta2.end_time AND ta2.start_time < ta1.end_time
        `;

        const lecturerConflicts = await db.query(lecturerConflictsQuery, [tenantId]);
        const roomConflicts = await db.query(roomConflictsQuery, [tenantId]);

        return {
            lecturerConflicts: lecturerConflicts.rows,
            roomConflicts: roomConflicts.rows
        };
    }
}

module.exports = new ReportService();
