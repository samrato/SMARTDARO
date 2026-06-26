const db = require('../database/pgDb');

class TimetableService {
    async generateTimetable(sessionId, userId, adminTenantId) {
        // Fetch academic session to check tenant ID
        const sessionRes = await db.query('SELECT tenant_id FROM academic_sessions WHERE id = $1', [sessionId]);
        if (sessionRes.rows.length === 0) {
            throw new Error("Academic session not found");
        }
        const tenantId = sessionRes.rows[0].tenant_id;

        if (adminTenantId && tenantId !== adminTenantId) {
            throw new Error("Academic session does not belong to your tenant");
        }

        // Find or create timetable version
        let versionRes = await db.query(
            'SELECT id FROM timetable_versions WHERE academic_session_id = $1 AND tenant_id = $2 LIMIT 1',
            [sessionId, tenantId]
        );
        let versionId;
        if (versionRes.rows.length > 0) {
            versionId = versionRes.rows[0].id;
        } else {
            const insertVersionRes = await db.query(
                `INSERT INTO timetable_versions (tenant_id, academic_session_id, version_number, status, created_by)
                 VALUES ($1, $2, $3, $4, $5) RETURNING id`,
                [tenantId, sessionId, 1, 'DRAFT', userId || 'system']
            );
            versionId = insertVersionRes.rows[0].id;
        }

        // Step 1: Clear previous allocations for this version
        await db.query(
            'DELETE FROM timetable_allocations WHERE timetable_version_id = $1',
            [versionId]
        );

        // Step 2: Fetch courses and rooms from PostgreSQL
        const coursesRes = await db.query(
            'SELECT id, code, capacity, instructor_id as "lecturer_id" FROM courses WHERE tenant_id = $1',
            [tenantId]
        );
        const roomsRes = await db.query(
            'SELECT id, name, capacity FROM rooms WHERE tenant_id = $1 AND is_available = TRUE',
            [tenantId]
        );

        const courses = coursesRes.rows.map(c => ({
            id: c.id,
            code: c.code,
            capacity: c.capacity,
            lecturer_id: c.lecturer_id
        }));
        const rooms = roomsRes.rows.map(r => ({
            id: r.id,
            name: r.name,
            capacity: r.capacity
        }));

        if (!courses || courses.length === 0) {
            throw new Error("No courses found to schedule");
        }
        if (!rooms || rooms.length === 0) {
            throw new Error("No rooms found to schedule");
        }

        // Define standard timeslots & days
        const days = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"];
        const slots = [
            { startTime: 8, endTime: 10 },
            { startTime: 10, endTime: 12 },
            { startTime: 13, endTime: 15 },
            { startTime: 15, endTime: 17 }
        ];

        const registrationsRes = await db.query(
            "SELECT student_id, unit_id FROM student_registrations WHERE tenant_id = $1 AND session_id = $2 AND registration_status = 'REGISTERED'",
            [tenantId, sessionId]
        );
        const courseStudents = {};
        for (const reg of registrationsRes.rows) {
            if (!courseStudents[reg.unit_id]) {
                courseStudents[reg.unit_id] = new Set();
            }
            courseStudents[reg.unit_id].add(reg.student_id);
        }

        const allocations = [];

        // Fetch constraints for this tenant
        const constraintsRes = await db.query('SELECT * FROM lecturer_constraints WHERE tenant_id = $1', [tenantId]);
        const lecturerConstraints = constraintsRes.rows;

        // Step 3: Constraint solving algorithm (evaluating resource collisions)
        for (const course of courses) {
            let allocated = false;

            for (const day of days) {
                if (allocated) break;
                for (const slot of slots) {
                    if (allocated) break;
                    for (const room of rooms) {
                        // Capacity check
                        if (room.capacity < course.capacity) continue;

                        // Room clash check
                        const roomConflict = allocations.some(a => 
                            a.roomId === room.id &&
                            a.dayOfWeek === day &&
                            a.startTime === slot.startTime
                        );
                        if (roomConflict) continue;

                        // Lecturer clash check
                        if (course.lecturer_id) {
                            const lecturerConflict = allocations.some(a => 
                                a.lecturerId === course.lecturer_id &&
                                a.dayOfWeek === day &&
                                a.startTime === slot.startTime
                            );
                            if (lecturerConflict) continue;
                        }

                        // Workload check
                        const lecturerConstraint = lecturerConstraints.find(c => c.lecturer_id === course.lecturer_id);
                        const maxHours = lecturerConstraint ? lecturerConstraint.max_hours_per_week : 20;

                        if (course.lecturer_id) {
                            const lecturerHours = allocations
                                .filter(a => a.lecturerId === course.lecturer_id)
                                .reduce((sum, a) => sum + (a.endTime - a.startTime), 0);
                            if (lecturerHours + (slot.endTime - slot.startTime) > maxHours) continue;
                        }

                        // Student clash check (prevent scheduling overlapping classes for students registered in both)
                        const currentCourseStudents = courseStudents[course.id] || new Set();
                        let studentConflict = false;
                        if (currentCourseStudents.size > 0) {
                            for (const alloc of allocations) {
                                if (alloc.dayOfWeek === day && alloc.startTime === slot.startTime) {
                                    const otherCourseStudents = courseStudents[alloc.courseUnitId] || new Set();
                                    for (const studId of currentCourseStudents) {
                                        if (otherCourseStudents.has(studId)) {
                                            studentConflict = true;
                                            break;
                                        }
                                    }
                                }
                                if (studentConflict) break;
                            }
                        }
                        if (studentConflict) continue;

                        // If all checks pass, record allocation!
                        allocations.push({
                            courseUnitId: course.id,
                            tenantId: tenantId,
                            roomId: room.id,
                            lecturerId: course.lecturer_id,
                            dayOfWeek: day,
                            startTime: slot.startTime,
                            endTime: slot.endTime,
                            academicSessionId: sessionId
                        });

                        allocated = true;
                        break;
                    }
                }
            }

            if (!allocated) {
                throw new Error(`Failed to allocate course unit ${course.code} due to resource conflicts.`);
            }
        }

        // Save allocations to PostgreSQL
        for (const alloc of allocations) {
            await db.query(
                `INSERT INTO timetable_allocations (tenant_id, timetable_version_id, course_id, room_id, lecturer_id, day_of_week, start_time, end_time)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
                [
                    tenantId,
                    versionId, 
                    alloc.courseUnitId,
                    alloc.roomId,
                    alloc.lecturerId || 'anonymous-lecturer',
                    alloc.dayOfWeek,
                    alloc.startTime,
                    alloc.endTime
                ]
            );
        }

        return allocations;
    }

    async getTimetableByDay(day, tenantId) {
        const result = await db.query(
            'SELECT * FROM timetable_allocations WHERE day_of_week = $1 AND tenant_id = $2',
            [day.toUpperCase(), tenantId]
        );
        return result.rows;
    }

    async getTimetableById(id, tenantId) {
        const result = await db.query(
            'SELECT * FROM timetable_allocations WHERE id = $1 AND tenant_id = $2',
            [id, tenantId]
        );
        return result.rows[0];
    }

    async deleteTimetable(id, tenantId) {
        return await db.query(
            'DELETE FROM timetable_allocations WHERE id = $1 AND tenant_id = $2',
            [id, tenantId]
        );
    }

    async getTimetableForUser(userId, userRole, tenantId) {
        let queryText = '';
        let params = [];

        if (userRole === 'instructor') {
            queryText = 'SELECT * FROM timetable_allocations WHERE lecturer_id = $1 AND tenant_id = $2';
            params = [userId, tenantId];
        } else if (userRole === 'student') {
            queryText = `
                SELECT ta.* FROM timetable_allocations ta
                JOIN student_registrations sr ON sr.unit_id = ta.course_id
                WHERE sr.student_id = $1 AND ta.tenant_id = $2 AND sr.tenant_id = $2
            `;
            params = [userId, tenantId];
        } else {
            return [];
        }

        const result = await db.query(queryText, params);
        return result.rows;
    }

    async getDraftTimetables(tenantId) {
        const result = await db.query(
            `SELECT ta.* FROM timetable_allocations ta
             JOIN timetable_versions tv ON ta.timetable_version_id = tv.id
             WHERE tv.status = 'DRAFT' AND ta.tenant_id = $1`,
            [tenantId]
        );
        return result.rows;
    }

    async getPublishedTimetables(tenantId) {
        const result = await db.query(
            `SELECT ta.* FROM timetable_allocations ta
             JOIN timetable_versions tv ON ta.timetable_version_id = tv.id
             WHERE tv.status = 'PUBLISHED' AND ta.tenant_id = $1`,
            [tenantId]
        );
        return result.rows;
    }

    async getLockedTimetables(tenantId) {
        const result = await db.query(
            `SELECT * FROM timetable_allocations WHERE locked_by IS NOT NULL AND tenant_id = $1`,
            [tenantId]
        );
        return result.rows;
    }

    async getTimetableVersions(tenantId) {
        const result = await db.query(
            'SELECT * FROM timetable_versions WHERE tenant_id = $1 ORDER BY version_number DESC',
            [tenantId]
        );
        return result.rows;
    }

    async getTimetableVersionById(id, tenantId) {
        const result = await db.query(
            'SELECT * FROM timetable_versions WHERE id = $1 AND tenant_id = $2',
            [id, tenantId]
        );
        return result.rows[0];
    }

    async restoreTimetableVersion(id, tenantId) {
        const versionRes = await db.query(
            'SELECT academic_session_id FROM timetable_versions WHERE id = $1 AND tenant_id = $2',
            [id, tenantId]
        );
        if (versionRes.rows.length === 0) {
            throw new Error("Timetable version not found");
        }
        const sessionId = versionRes.rows[0].academic_session_id;

        const client = await db.pool.connect();
        try {
            await client.query('BEGIN');
            
            await client.query(
                "UPDATE timetable_versions SET status = 'ARCHIVED' WHERE academic_session_id = $1 AND tenant_id = $2 AND id <> $3",
                [sessionId, tenantId, id]
            );
            
            const result = await client.query(
                "UPDATE timetable_versions SET status = 'DRAFT', created_at = NOW() WHERE id = $1 AND tenant_id = $2 RETURNING *",
                [id, tenantId]
            );
            
            await client.query('COMMIT');
            return result.rows[0];
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async getStudentTimetable(studentId, tenantId, sessionId = null) {
        let query = `
            SELECT ta.*, c.name as "courseName", c.code as "courseCode", r.name as "roomName"
            FROM timetable_allocations ta
            JOIN student_registrations sr ON sr.unit_id = ta.course_id
            JOIN courses c ON ta.course_id::uuid = c.id
            JOIN rooms r ON ta.room_id::uuid = r.id
            WHERE sr.student_id = $1 AND ta.tenant_id = $2 AND sr.tenant_id = $2 AND sr.registration_status = 'REGISTERED'
        `;
        const params = [studentId, tenantId];
        if (sessionId) {
            query += ' AND sr.session_id = $3';
            params.push(sessionId);
        }
        const result = await db.query(query, params);
        return result.rows;
    }

    async getLecturerTimetable(lecturerId, tenantId, sessionId = null) {
        let query = `
            SELECT ta.*, c.name as "courseName", c.code as "courseCode", r.name as "roomName"
            FROM timetable_allocations ta
            JOIN courses c ON ta.course_id::uuid = c.id
            JOIN rooms r ON ta.room_id::uuid = r.id
            JOIN timetable_versions tv ON ta.timetable_version_id = tv.id
            WHERE ta.lecturer_id = $1 AND ta.tenant_id = $2
        `;
        const params = [lecturerId, tenantId];
        if (sessionId) {
            query += ' AND tv.academic_session_id = $3';
            params.push(sessionId);
        }
        const result = await db.query(query, params);
        return result.rows;
    }

    async getDepartmentTimetable(deptId, tenantId) {
        const result = await db.query(
            `SELECT ta.*, c.name as "courseName", c.code as "courseCode", r.name as "roomName"
             FROM timetable_allocations ta
             JOIN courses c ON ta.course_id::uuid = c.id
             JOIN rooms r ON ta.room_id::uuid = r.id
             WHERE c.department_id = $1 AND ta.tenant_id = $2`,
            [deptId, tenantId]
        );
        return result.rows;
    }

    async getRoomTimetable(roomId, tenantId) {
        const result = await db.query(
            `SELECT ta.*, c.name as "courseName", c.code as "courseCode", r.name as "roomName"
             FROM timetable_allocations ta
             JOIN courses c ON ta.course_id::uuid = c.id
             JOIN rooms r ON ta.room_id::uuid = r.id
             WHERE ta.room_id = $1 AND ta.tenant_id = $2`,
            [roomId, tenantId]
        );
        return result.rows;
    }
}

module.exports = new TimetableService();