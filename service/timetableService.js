const db = require('../database/pgDb');
const Course = require('../models/course');
const Venue = require('../models/venue');

class TimetableService {
    async generateTimetable(sessionId, userId) {
        // Fetch academic session to check tenant ID
        const sessionRes = await db.query('SELECT tenant_id FROM academic_sessions WHERE id = $1', [sessionId]);
        if (sessionRes.rows.length === 0) {
            throw new Error("Academic session not found");
        }
        const tenantId = sessionRes.rows[0].tenant_id;

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

        // Step 2: Fetch courses and venues from MongoDB
        const rawCourses = await Course.find().lean();
        const rawRooms = await Venue.find().lean();

        if (!rawCourses || rawCourses.length === 0) {
            throw new Error("No courses found to schedule");
        }
        if (!rawRooms || rawRooms.length === 0) {
            throw new Error("No rooms found to schedule");
        }

        // Map MongoDB fields to the solver properties
        const courses = rawCourses.map(c => ({
            id: c._id.toString(),
            code: c.code,
            capacity: c.capacity || 40,
            lecturer_id: c.instructor ? c.instructor.toString() : null
        }));

        const rooms = rawRooms.map(r => ({
            id: r._id.toString(),
            name: r.name,
            capacity: r.capacity || 40
        }));

        // Define standard timeslots & days
        const days = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"];
        const slots = [
            { startTime: 8, endTime: 10 },
            { startTime: 10, endTime: 12 },
            { startTime: 13, endTime: 15 },
            { startTime: 15, endTime: 17 }
        ];

        const allocations = [];

        // Fetch constraints
        const constraintsRes = await db.query('SELECT * FROM lecturer_constraints');
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

                        // If all checks pass, record allocation!
                        allocations.push({
                            courseUnitId: course.id,
                            tenantId: course.tenant_id,
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

    async getTimetableByDay(day) {
        const result = await db.query(
            'SELECT * FROM timetable_allocations WHERE day_of_week = $1',
            [day.toUpperCase()]
        );
        return result.rows;
    }

    async getTimetableById(id) {
        const result = await db.query(
            'SELECT * FROM timetable_allocations WHERE id = $1',
            [id]
        );
        return result.rows[0];
    }

    async deleteTimetable(id) {
        return await db.query(
            'DELETE FROM timetable_allocations WHERE id = $1',
            [id]
        );
    }

    async getTimetableForUser(userId, userRole) {
        let queryText = '';
        let params = [];

        if (userRole === 'instructor') {
            queryText = 'SELECT * FROM timetable_allocations WHERE lecturer_id = $1';
            params = [userId];
        } else if (userRole === 'student') {
            queryText = `
                SELECT ta.* FROM timetable_allocations ta
                JOIN student_registrations sr ON sr.unit_id = ta.course_id
                WHERE sr.student_id = $1
            `;
            params = [userId];
        } else {
            return [];
        }

        const result = await db.query(queryText, params);
        return result.rows;
    }
}

module.exports = new TimetableService();