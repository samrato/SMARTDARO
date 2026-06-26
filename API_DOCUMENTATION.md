# SmartDaro Backend API Specification

This document provides a detailed description of the SmartDaro API endpoints, request bodies, required headers, security constraints, and response schemas.

**Base URL:** `/api`

---

## Headers & Security Context

All protected endpoints require the following headers for authorization and tenant isolation:

| Header Name | Type | Description | Required For |
| :--- | :--- | :--- | :--- |
| `Authorization` | String | JWT bearer token in format `Bearer <token>` | All protected endpoints |
| `x-tenant-id` | UUID | The tenant identifier associated with the request | Multi-tenant isolated endpoints |

---

## 1. Authentication & Users

### Register User
* **Method & Path:** `POST /users/register`
* **Access:** Public (Restriction: Roles `admin` and `instructor` require existing admin token auth if an administrator already exists in the system)
* **Request Headers:**
  * `x-tenant-id`: UUID (Optional, defaults to institutional default)
* **Request Body:**
```json
{
  "fullName": "Dr. Jane Smith",
  "email": "jane.smith@smartdaro.edu",
  "password": "securepassword",
  "password2": "securepassword",
  "role": "instructor"
}
```
* **Success Response (201 Created):**
```json
{
  "message": "User Dr. Jane Smith registered successfully"
}
```
* **Error Response (403 Forbidden):**
```json
{
  "message": "Only administrators can create admin or instructor accounts"
}
```

### Login User
* **Method & Path:** `POST /users/login`
* **Access:** Public
* **Request Body:**
```json
{
  "email": "jane.smith@smartdaro.edu",
  "password": "securepassword"
}
```
* **Success Response (200 OK):**
```json
{
  "token": "JWT_TOKEN",
  "userId": "UUID",
  "role": "instructor",
  "isAdmin": false,
  "tenantId": "UUID"
}
```

### Get User Preferences
* **Method & Path:** `GET /users/:userId`
* **Access:** Authenticated (Tenant Isolated)
* **Success Response (200 OK):**
```json
{
  "status": "success",
  "user": {
    "id": "UUID",
    "fullName": "Dr. Jane Smith",
    "email": "jane.smith@smartdaro.edu",
    "isAdmin": false,
    "role": "instructor",
    "tenantId": "UUID",
    "preferences": {}
  }
}
```

---

## 2. Academic Catalog

### Create Faculty
* **Method & Path:** `POST /academic-catalogs/faculties`
* **Access:** Admin
* **Request Body:**
```json
{
  "name": "Faculty of Engineering",
  "code": "ENG"
}
```
* **Success Response (201 Created):**
```json
{
  "status": "success",
  "faculty": {
    "id": "UUID",
    "tenant_id": "UUID",
    "name": "Faculty of Engineering",
    "code": "ENG",
    "created_at": "TIMESTAMP"
  }
}
```

### List Faculties
* **Method & Path:** `GET /academic-catalogs/faculties`
* **Access:** Authenticated (Tenant Isolated)
* **Success Response (200 OK):**
```json
{
  "status": "success",
  "faculties": [ ... ]
}
```

### Create Department
* **Method & Path:** `POST /academic-catalogs/departments`
* **Access:** Admin
* **Request Body:**
```json
{
  "facultyId": "UUID",
  "name": "Department of Computer Science",
  "code": "CS"
}
```
* **Success Response (201 Created):**
```json
{
  "status": "success",
  "department": {
    "id": "UUID",
    "tenant_id": "UUID",
    "faculty_id": "UUID",
    "name": "Department of Computer Science",
    "code": "CS",
    "created_at": "TIMESTAMP"
  }
}
```

### List Departments
* **Method & Path:** `GET /academic-catalogs/departments`
* **Access:** Authenticated (Tenant Isolated)
* **Query Parameters:**
  * `facultyId`: UUID (Optional)
* **Success Response (200 OK):**
```json
{
  "status": "success",
  "departments": [ ... ]
}
```

---

## 3. Venues & Courses

### List Venues
* **Method & Path:** `GET /venues`
* **Access:** Authenticated (Tenant Isolated)
* **Success Response (200 OK):**
```json
{
  "status": "success",
  "venues": [
    {
      "id": "UUID",
      "name": "Auditorium CS-A",
      "capacity": 100,
      "location": "Building CS",
      "isAvailable": true
    }
  ]
}
```

### Create Course
* **Method & Path:** `POST /courses`
* **Access:** Admin
* **Request Body:**
```json
{
  "name": "Operating Systems",
  "code": "CS302",
  "instructorId": "UUID",
  "capacity": 80,
  "duration": 2
}
```
* **Success Response (201 Created):**
```json
{
  "status": "success",
  "course": {
    "id": "UUID",
    "name": "Operating Systems",
    "code": "CS302",
    "capacity": 80,
    "duration": 2,
    "instructorId": "UUID"
  }
}
```

---

## 4. Timetable Management

### AI Allocate Timetable
* **Method & Path:** `POST /timetables/allocate-ai`
* **Access:** Admin (Tenant Isolated)
* **Request Body:**
```json
{
  "sessionId": "UUID"
}
```
* **Success Response (202 Accepted):**
```json
{
  "status": "queued",
  "message": "Timetable generation has been enqueued asynchronously.",
  "jobId": 1
}
```

### List Timetables by Day
* **Method & Path:** `GET /timetables/:day`
* **Access:** Authenticated (Tenant & Cache Scoped)
* **Success Response (200 OK):**
```json
{
  "status": "success",
  "timetables": [
    {
      "id": "UUID",
      "tenant_id": "UUID",
      "timetable_version_id": "UUID",
      "course_id": "UUID",
      "room_id": "UUID",
      "lecturer_id": "UUID",
      "day_of_week": "MONDAY",
      "start_time": 8,
      "end_time": 10
    }
  ]
}
```

---

## 5. Examination Management

### Create Exam
* **Method & Path:** `POST /exams`
* **Access:** Admin
* **Request Body:**
```json
{
  "academicSessionId": "UUID",
  "courseId": "UUID",
  "type": "MAIN",
  "examDate": "2026-12-10",
  "startTime": 9,
  "endTime": 12
}
```
* **Success Response (201 Created):**
```json
{
  "status": "success",
  "exam": {
    "id": "UUID",
    "tenant_id": "UUID",
    "academic_session_id": "UUID",
    "course_id": "UUID",
    "type": "MAIN",
    "exam_date": "2026-12-10",
    "start_time": 9,
    "end_time": 12
  }
}
```

### Allocate Room for Exam
* **Method & Path:** `POST /exams/allocate-room`
* **Access:** Admin (Enforces room capacity & collision validations)
* **Request Body:**
```json
{
  "examId": "UUID",
  "roomId": "UUID",
  "seatingCapacity": 60
}
```
* **Success Response (201 Created):**
```json
{
  "status": "success",
  "allocation": {
    "id": "UUID",
    "tenant_id": "UUID",
    "exam_id": "UUID",
    "room_id": "UUID",
    "seating_capacity": 60
  }
}
```

### Assign Invigilator
* **Method & Path:** `POST /exams/assign-invigilator`
* **Access:** Admin (Enforces instructor scheduling conflict validations)
* **Request Body:**
```json
{
  "examAllocationId": "UUID",
  "invigilatorId": "UUID"
}
```
* **Success Response (201 Created):**
```json
{
  "status": "success",
  "assignment": {
    "id": "UUID",
    "tenant_id": "UUID",
    "exam_allocation_id": "UUID",
    "invigilator_id": "UUID"
  }
}
```

---

## 6. Campuses & Academic Sessions

### Create Campus
* **Method & Path:** `POST /campuses`
* **Access:** Admin
* **Request Body:**
```json
{
  "name": "Main Campus",
  "location": "Downtown District"
}
```
* **Success Response (201 Created):**
```json
{
  "status": "success",
  "campus": {
    "id": "UUID",
    "tenant_id": "UUID",
    "name": "Main Campus",
    "location": "Downtown District",
    "created_at": "TIMESTAMP"
  }
}
```

### List Campuses
* **Method & Path:** `GET /campuses`
* **Access:** Authenticated (Tenant Isolated)
* **Success Response (200 OK):**
```json
{
  "status": "success",
  "campuses": [ ... ]
}
```

### Get Campus By ID
* **Method & Path:** `GET /campuses/:id`
* **Access:** Authenticated (Tenant Isolated)
* **Success Response (200 OK):**
```json
{
  "status": "success",
  "campus": {
    "id": "UUID",
    "name": "Main Campus",
    "location": "Downtown District"
  }
}
```

### Update Campus
* **Method & Path:** `PUT /campuses/:id`
* **Access:** Admin
* **Request Body:**
```json
{
  "name": "Main Campus Updated",
  "location": "New Downtown Location"
}
```
* **Success Response (200 OK):**
```json
{
  "status": "success",
  "campus": {
    "id": "UUID",
    "name": "Main Campus Updated",
    "location": "New Downtown Location"
  }
}
```

### Delete Campus
* **Method & Path:** `DELETE /campuses/:id`
* **Access:** Admin
* **Success Response (200 OK):**
```json
{
  "status": "success",
  "message": "Campus deleted successfully"
}
```

### Create Academic Session
* **Method & Path:** `POST /academic-sessions`
* **Access:** Admin
* **Request Body:**
```json
{
  "yearLabel": "2026",
  "termLabel": "Semester 1",
  "startDate": "2026-09-01",
  "endDate": "2026-12-20",
  "isActive": true
}
```
* **Success Response (201 Created):**
```json
{
  "status": "success",
  "session": {
    "id": "UUID",
    "tenant_id": "UUID",
    "year_label": "2026",
    "term_label": "Semester 1",
    "start_date": "2026-09-01",
    "end_date": "2026-12-20",
    "is_active": true
  }
}
```

### List Academic Sessions
* **Method & Path:** `GET /academic-sessions`
* **Access:** Authenticated
* **Success Response (200 OK):**
```json
{
  "status": "success",
  "sessions": [ ... ]
}
```

### Get Academic Session By ID
* **Method & Path:** `GET /academic-sessions/:id`
* **Access:** Authenticated
* **Success Response (200 OK):**
```json
{
  "status": "success",
  "session": { ... }
}
```

### Update Academic Session
* **Method & Path:** `PUT /academic-sessions/:id`
* **Access:** Admin
* **Request Body:**
```json
{
  "isActive": true
}
```
* **Success Response (200 OK):**
```json
{
  "status": "success",
  "session": { ... }
}
```

### Delete Academic Session
* **Method & Path:** `DELETE /academic-sessions/:id`
* **Access:** Admin
* **Success Response (200 OK):**
```json
{
  "status": "success",
  "message": "Academic session deleted successfully"
}
```

### Get Active Academic Session
* **Method & Path:** `GET /academic-sessions/active`
* **Access:** Authenticated
* **Success Response (200 OK):**
```json
{
  "status": "success",
  "session": {
    "id": "UUID",
    "is_active": true,
    ...
  }
}
```

---

## 7. Room Suitability & Tags

### Create Room Tag
* **Method & Path:** `POST /room-tags`
* **Access:** Admin
* **Request Body:**
```json
{
  "tagName": "COMPUTER_LAB"
}
```
* **Success Response (201 Created):**
```json
{
  "status": "success",
  "tag": {
    "id": "UUID",
    "tagName": "COMPUTER_LAB"
  }
}
```

### List Room Tags
* **Method & Path:** `GET /room-tags`
* **Access:** Authenticated
* **Success Response (200 OK):**
```json
{
  "status": "success",
  "tags": [
    {
      "id": "UUID",
      "tagName": "COMPUTER_LAB"
    }
  ]
}
```

### Assign Tag to Venue
* **Method & Path:** `POST /venues/:id/tags`
* **Access:** Admin
* **Request Body:**
```json
{
  "tagId": "UUID"
}
```
* **Success Response (201 Created):**
```json
{
  "status": "success",
  "relation": {
    "id": "UUID",
    "venueId": "UUID",
    "tagId": "UUID"
  }
}
```

### List Venue Tags
* **Method & Path:** `GET /venues/:id/tags`
* **Access:** Authenticated
* **Success Response (200 OK):**
```json
{
  "status": "success",
  "tags": [
    {
      "id": "UUID",
      "venueId": "UUID",
      "tagId": "UUID",
      "tagName": "COMPUTER_LAB"
    }
  ]
}
```

### Remove Tag from Venue
* **Method & Path:** `DELETE /venues/:id/tags/:tagId`
* **Access:** Admin
* **Success Response (200 OK):**
```json
{
  "status": "success",
  "message": "Venue tag removed successfully"
}
```

---

## 8. Lecturer Constraints & Course Streams

### Upsert Lecturer Constraints
* **Method & Path:** `POST /lecturer-constraints` / `PUT /lecturer-constraints/:lecturerId`
* **Access:** Authenticated (Tenant Isolated)
* **Request Body:**
```json
{
  "lecturerId": "UUID",
  "preferredDays": ["MONDAY", "WEDNESDAY"],
  "preferredTimeSlots": ["08:00-10:00", "14:00-16:00"],
  "unavailableDays": ["FRIDAY"],
  "maxHoursPerWeek": 16,
  "maxClassesPerDay": 3,
  "homeCampus": "Main Campus",
  "travelBufferMinutes": 60
}
```
* **Success Response (200 OK / 201 Created):**
```json
{
  "status": "success",
  "constraints": { ... }
}
```

### Get Lecturer Constraints
* **Method & Path:** `GET /lecturer-constraints/:lecturerId`
* **Access:** Authenticated
* **Success Response (200 OK):**
```json
{
  "status": "success",
  "constraints": { ... }
}
```

### Delete Lecturer Constraints
* **Method & Path:** `DELETE /lecturer-constraints/:lecturerId`
* **Access:** Admin
* **Success Response (200 OK):**
```json
{
  "status": "success",
  "message": "Constraints deleted successfully"
}
```

### Create Course Stream
* **Method & Path:** `POST /course-streams`
* **Access:** Admin
* **Request Body:**
```json
{
  "courseId": "UUID",
  "academicSessionId": "UUID",
  "streamCode": "CS-A",
  "streamName": "Computer Science Stream A",
  "capacity": 50
}
```
* **Success Response (201 Created):**
```json
{
  "status": "success",
  "stream": { ... }
}
```

### List Course Streams
* **Method & Path:** `GET /course-streams`
* **Access:** Authenticated
* **Success Response (200 OK):**
```json
{
  "status": "success",
  "streams": [ ... ]
}
```

### Get Course Stream By ID
* **Method & Path:** `GET /course-streams/:id`
* **Access:** Authenticated
* **Success Response (200 OK):**
```json
{
  "status": "success",
  "stream": { ... }
}
```

### Update Course Stream
* **Method & Path:** `PUT /course-streams/:id`
* **Access:** Admin
* **Success Response (200 OK):**
```json
{
  "status": "success",
  "stream": { ... }
}
```

### Delete Course Stream
* **Method & Path:** `DELETE /course-streams/:id`
* **Access:** Admin
* **Success Response (200 OK):**
```json
{
  "status": "success",
  "message": "Course stream deleted successfully"
}
```

---

## 9. Student Registrations & Accommodations

### Register Student to Unit/Course
* **Method & Path:** `POST /student-registrations`
* **Access:** Authenticated
* **Request Body:**
```json
{
  "studentId": "UUID",
  "unitId": "UUID",
  "sessionId": "UUID"
}
```
* **Success Response (201 Created):**
```json
{
  "status": "success",
  "registration": {
    "id": "UUID",
    "student_id": "UUID",
    "unit_id": "UUID",
    "session_id": "UUID",
    "registration_status": "REGISTERED"
  }
}
```

### List Student Registrations
* **Method & Path:** `GET /student-registrations`
* **Access:** Authenticated
* **Success Response (200 OK):**
```json
{
  "status": "success",
  "registrations": [ ... ]
}
```

### Get Registrations by Student ID
* **Method & Path:** `GET /student-registrations/:studentId`
* **Access:** Authenticated
* **Success Response (200 OK):**
```json
{
  "status": "success",
  "registrations": [ ... ]
}
```

### Delete Student Registration
* **Method & Path:** `DELETE /student-registrations/:id`
* **Access:** Admin
* **Success Response (200 OK):**
```json
{
  "status": "success",
  "message": "Registration deleted successfully"
}
```

### Set Student Accommodations
* **Method & Path:** `POST /student-accommodations` / `PUT /student-accommodations/:studentId`
* **Access:** Admin
* **Request Body:**
```json
{
  "studentId": "UUID",
  "accommodationType": "EXTRA_TIME",
  "extraTimeRatio": 1.5
}
```
* **Success Response (200 OK / 201 Created):**
```json
{
  "status": "success",
  "accommodation": {
    "student_id": "UUID",
    "accommodation_type": "EXTRA_TIME",
    "extra_time_ratio": 1.5
  }
}
```

### Get Student Accommodations
* **Method & Path:** `GET /student-accommodations/:studentId`
* **Access:** Authenticated
* **Success Response (200 OK):**
```json
{
  "status": "success",
  "accommodation": { ... }
}
```

---

## 10. Advanced Timetable Management

### Publish Timetable for Session
* **Method & Path:** `PUT /timetables/publish/:sessionId`
* **Access:** Admin
* **Success Response (200 OK):**
```json
{
  "status": "success",
  "message": "Timetable published successfully"
}
```

### Unpublish Timetable for Session
* **Method & Path:** `PUT /timetables/unpublish/:sessionId`
* **Access:** Admin
* **Success Response (200 OK):**
```json
{
  "status": "success",
  "message": "Timetable unpublished successfully"
}
```

### Get Draft Timetables
* **Method & Path:** `GET /timetables/drafts`
* **Access:** Authenticated
* **Success Response (200 OK):**
```json
{
  "status": "success",
  "timetables": [ ... ]
}
```

### Get Published Timetables
* **Method & Path:** `GET /timetables/published`
* **Access:** Authenticated
* **Success Response (200 OK):**
```json
{
  "status": "success",
  "timetables": [ ... ]
}
```

### Lock Timetable Allocation
* **Method & Path:** `PUT /timetables/lock/:allocationId`
* **Access:** Admin
* **Request Body:**
```json
{
  "lockedBy": "Admin Name",
  "lockReason": "Special VIP Booking"
}
```
* **Success Response (200 OK):**
```json
{
  "status": "success",
  "message": "Timetable allocation locked successfully"
}
```

### Unlock Timetable Allocation
* **Method & Path:** `PUT /timetables/unlock/:allocationId`
* **Access:** Admin
* **Success Response (200 OK):**
```json
{
  "status": "success",
  "message": "Timetable allocation unlocked successfully"
}
```

### List Locked Timetables
* **Method & Path:** `GET /timetables/locked`
* **Access:** Authenticated
* **Success Response (200 OK):**
```json
{
  "status": "success",
  "timetables": [ ... ]
}
```

### List Timetable Versions
* **Method & Path:** `GET /timetable-versions`
* **Access:** Authenticated
* **Success Response (200 OK):**
```json
{
  "status": "success",
  "versions": [ ... ]
}
```

### Get Timetable Version By ID
* **Method & Path:** `GET /timetable-versions/:id`
* **Access:** Authenticated
* **Success Response (200 OK):**
```json
{
  "status": "success",
  "version": { ... }
}
```

### Restore Timetable Version
* **Method & Path:** `POST /timetable-versions/:id/restore`
* **Access:** Admin
* **Success Response (200 OK):**
```json
{
  "status": "success",
  "message": "Version restored successfully",
  "version": { ... }
}
```

---

## 11. Student, Lecturer, Department & Room Timetables

### Get Student Timetable
* **Method & Path:** `GET /students/:id/timetable`
* **Access:** Authenticated
* **Success Response (200 OK):**
```json
{
  "status": "success",
  "timetables": [ ... ]
}
```

### Get Student Current Active Timetable
* **Method & Path:** `GET /students/:id/timetable/current`
* **Access:** Authenticated (Fetches timetable for the active academic session)
* **Success Response (200 OK):**
```json
{
  "status": "success",
  "timetables": [ ... ]
}
```

### Get Student Timetable for Specific Session
* **Method & Path:** `GET /students/:id/timetable/session/:sessionId`
* **Access:** Authenticated
* **Success Response (200 OK):**
```json
{
  "status": "success",
  "timetables": [ ... ]
}
```

### Get Lecturer Timetable
* **Method & Path:** `GET /lecturers/:id/timetable`
* **Access:** Authenticated
* **Success Response (200 OK):**
```json
{
  "status": "success",
  "timetables": [ ... ]
}
```

### Get Lecturer Current Active Timetable
* **Method & Path:** `GET /lecturers/:id/timetable/current`
* **Access:** Authenticated (Fetches timetable for the active academic session)
* **Success Response (200 OK):**
```json
{
  "status": "success",
  "timetables": [ ... ]
}
```

### Get Department Timetable
* **Method & Path:** `GET /departments/:id/timetable`
* **Access:** Authenticated
* **Success Response (200 OK):**
```json
{
  "status": "success",
  "timetables": [ ... ]
}
```

### Get Room/Venue Timetable
* **Method & Path:** `GET /venues/:id/timetable`
* **Access:** Authenticated
* **Success Response (200 OK):**
```json
{
  "status": "success",
  "timetables": [ ... ]
}
```

---

## 12. Exam Scheduling Engine & Seating Plans

### AI Exam Scheduler Engine
* **Method & Path:** `POST /exams/schedule-ai`
* **Access:** Admin
* **Request Body:**
```json
{
  "sessionId": "UUID"
}
```
* **Success Response (200 OK):**
```json
{
  "status": "success",
  "message": "AI Exam scheduling algorithm initiated successfully."
}
```

### List Exams
* **Method & Path:** `GET /exams`
* **Access:** Authenticated
* **Success Response (200 OK):**
```json
{
  "status": "success",
  "exams": [ ... ]
}
```

### Get Exam By ID
* **Method & Path:** `GET /exams/:id`
* **Access:** Authenticated
* **Success Response (200 OK):**
```json
{
  "status": "success",
  "exam": { ... }
}
```

### Update Exam Details
* **Method & Path:** `PUT /exams/:id`
* **Access:** Admin
* **Success Response (200 OK):**
```json
{
  "status": "success",
  "exam": { ... }
}
```

### Delete Exam
* **Method & Path:** `DELETE /exams/:id`
* **Access:** Admin
* **Success Response (200 OK):**
```json
{
  "status": "success",
  "message": "Exam deleted successfully"
}
```

### Create Supplementary Exam
* **Method & Path:** `POST /exams/supplementary`
* **Access:** Admin
* **Request Body:**
```json
{
  "academicSessionId": "UUID",
  "courseId": "UUID",
  "examDate": "2026-12-15",
  "startTime": 14,
  "endTime": 17
}
```
* **Success Response (201 Created):**
```json
{
  "status": "success",
  "exam": {
    "type": "SUPPLEMENTARY",
    ...
  }
}
```

### Create Deferred Exam
* **Method & Path:** `POST /exams/deferred`
* **Access:** Admin
* **Request Body:**
```json
{
  "academicSessionId": "UUID",
  "courseId": "UUID",
  "examDate": "2026-12-16",
  "startTime": 9,
  "endTime": 12
}
```
* **Success Response (201 Created):**
```json
{
  "status": "success",
  "exam": {
    "type": "DEFERRED",
    ...
  }
}
```

### Generate Seating Plan
* **Method & Path:** `POST /exams/:id/generate-seating-plan`
* **Access:** Admin
* **Success Response (201 Created):**
```json
{
  "status": "success",
  "message": "Seating plan generated successfully"
}
```

### Get Seating Plan for Exam
* **Method & Path:** `GET /exams/:id/seating-plan`
* **Access:** Authenticated
* **Success Response (200 OK):**
```json
{
  "status": "success",
  "seatingPlan": [
    {
      "id": "UUID",
      "student_id": "UUID",
      "studentName": "Full Name",
      "seat_number": "A-1"
    }
  ]
}
```

### Update Seat Assignment
* **Method & Path:** `PUT /seating-plans/:seatId`
* **Access:** Admin
* **Request Body:**
```json
{
  "seatNumber": "B-3"
}
```
* **Success Response (200 OK):**
```json
{
  "status": "success",
  "message": "Seat assignment updated successfully"
}
```

---

## 13. Academic Calendar Events

### Create Calendar Event
* **Method & Path:** `POST /academic-calendar/events`
* **Access:** Admin
* **Request Body:**
```json
{
  "title": "Semester Registration Commencement",
  "eventDate": "2026-08-15",
  "description": "Registration opens for all students."
}
```
* **Success Response (201 Created):**
```json
{
  "status": "success",
  "event": {
    "id": "UUID",
    "title": "Semester Registration Commencement",
    "event_date": "2026-08-15",
    "description": "Registration opens for all students."
  }
}
```

### List Calendar Events
* **Method & Path:** `GET /academic-calendar/events`
* **Access:** Authenticated
* **Success Response (200 OK):**
```json
{
  "status": "success",
  "events": [ ... ]
}
```

### Update Calendar Event
* **Method & Path:** `PUT /academic-calendar/events/:id`
* **Access:** Admin
* **Request Body:**
```json
{
  "title": "Semester Registration Commencement (Delayed)"
}
```
* **Success Response (200 OK):**
```json
{
  "status": "success",
  "event": { ... }
}
```

### Delete Calendar Event
* **Method & Path:** `DELETE /academic-calendar/events/:id`
* **Access:** Admin
* **Success Response (200 OK):**
```json
{
  "status": "success",
  "message": "Event deleted successfully"
}
```

---

## 14. Notifications & Audit Logs

### List Notifications
* **Method & Path:** `GET /notifications`
* **Access:** Authenticated
* **Success Response (200 OK):**
```json
{
  "status": "success",
  "notifications": [ ... ]
}
```

### List Unread Notifications
* **Method & Path:** `GET /notifications/unread`
* **Access:** Authenticated
* **Success Response (200 OK):**
```json
{
  "status": "success",
  "notifications": [ ... ]
}
```

### Mark Notification as Read
* **Method & Path:** `PUT /notifications/:id/read`
* **Access:** Authenticated
* **Success Response (200 OK):**
```json
{
  "status": "success",
  "notification": {
    "id": "UUID",
    "is_read": true
  }
}
```

### List Audit Logs
* **Method & Path:** `GET /audit-logs`
* **Access:** Admin
* **Success Response (200 OK):**
```json
{
  "status": "success",
  "logs": [ ... ]
}
```

### Get Audit Logs by Entity ID
* **Method & Path:** `GET /audit-logs/entity/:entityId`
* **Access:** Admin
* **Success Response (200 OK):**
```json
{
  "status": "success",
  "logs": [ ... ]
}
```

### Get Audit Logs by User ID
* **Method & Path:** `GET /audit-logs/user/:userId`
* **Access:** Admin
* **Success Response (200 OK):**
```json
{
  "status": "success",
  "logs": [ ... ]
}
```

---

## 15. Reports & Analytics

### Get Lecturer Workload Report
* **Method & Path:** `GET /reports/lecturer-workload`
* **Access:** Admin
* **Success Response (200 OK):**
```json
{
  "status": "success",
  "data": [
    {
      "lecturerId": "UUID",
      "lecturerName": "Dr. Jane Smith",
      "totalHours": 12
    }
  ]
}
```

### Get Room Utilization Report
* **Method & Path:** `GET /reports/room-utilization`
* **Access:** Admin
* **Success Response (200 OK):**
```json
{
  "status": "success",
  "data": [
    {
      "roomId": "UUID",
      "roomName": "CS-A101",
      "capacity": 80,
      "occupiedHours": 18
    }
  ]
}
```

### Get Student Timetable Report
* **Method & Path:** `GET /reports/student-timetable`
* **Access:** Admin
* **Success Response (200 OK):**
```json
{
  "status": "success",
  "data": [
    {
      "studentId": "UUID",
      "studentName": "John Doe",
      "courseId": "UUID",
      "courseName": "Operating Systems",
      "day": "MONDAY",
      "startTime": 8,
      "endTime": 10
    }
  ]
}
```

### Get Exam Room Utilization Report
* **Method & Path:** `GET /reports/exam-utilization`
* **Access:** Admin
* **Success Response (200 OK):**
```json
{
  "status": "success",
  "data": [
    {
      "examId": "UUID",
      "courseName": "Operating Systems",
      "examDate": "2026-12-10",
      "startTime": 9,
      "endTime": 12,
      "roomId": "UUID",
      "roomName": "Exam Hall A",
      "seatingCapacity": 60,
      "roomCapacity": 120,
      "utilizationPercentage": 50.00
    }
  ]
}
```

### Get Conflicts Report
* **Method & Path:** `GET /reports/conflicts`
* **Access:** Admin
* **Success Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "lecturerConflicts": [ ... ],
    "roomConflicts": [ ... ]
  }
}
```

---

## 16. LMS Integrations

### Connect to Moodle
* **Method & Path:** `POST /integrations/moodle/connect`
* **Access:** Admin
* **Request Body:**
```json
{
  "url": "https://moodle.smartdaro.edu",
  "token": "moodle_api_token"
}
```
* **Success Response (200 OK):**
```json
{
  "status": "success",
  "message": "Connected to Moodle successfully",
  "details": {
    "tenantId": "UUID",
    "url": "https://moodle.smartdaro.edu",
    "connectedAt": "TIMESTAMP"
  }
}
```

### Connect to Canvas
* **Method & Path:** `POST /integrations/canvas/connect`
* **Access:** Admin
* **Request Body:**
```json
{
  "url": "https://canvas.smartdaro.edu",
  "token": "canvas_api_token"
}
```
* **Success Response (200 OK):**
```json
{
  "status": "success",
  "message": "Connected to Canvas successfully",
  "details": {
    "tenantId": "UUID",
    "url": "https://canvas.smartdaro.edu",
    "connectedAt": "TIMESTAMP"
  }
}
```

### Sync with Moodle
* **Method & Path:** `POST /integrations/moodle/sync`
* **Access:** Admin
* **Success Response (200 OK):**
```json
{
  "status": "success",
  "message": "Moodle synchronization completed successfully",
  "syncedCount": 15,
  "syncedAt": "TIMESTAMP"
}
```

### Sync with Canvas
* **Method & Path:** `POST /integrations/canvas/sync`
* **Access:** Admin
* **Success Response (200 OK):**
```json
{
  "status": "success",
  "message": "Canvas synchronization completed successfully",
  "syncedCount": 22,
  "syncedAt": "TIMESTAMP"
}
```

