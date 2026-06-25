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
