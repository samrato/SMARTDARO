### API Documentation

This document provides a detailed description of the SmartDaro API endpoints.

**Base URL:** `/api`

---

### Authentication

| Method | Endpoint      | Description        | Request Body                  | Response (Success)                                                                 | Response (Error)                                       |
| ------ | ------------- | ------------------ | ----------------------------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------ |
| POST   | `/users/register` | Register a new user | `{ "fullName", "email", "password" }` | `{ "message": "User registered successfully" }`                                    | `{ "message": "User already exists" }`                 |
| POST   | `/users/login`    | Login a user       | `{ "email", "password" }`       | `{ "token": "JWT_TOKEN", "user": { "id", "fullName", "email", "isAdmin" } }` | `{ "message": "Invalid credentials" }`                 |
| GET    | `/users/:userId`  | Get user details   | (none)                        | `{ "id", "fullName", "email", "isAdmin" }`                                         | `{ "message": "User not found" }`                      |
| PUT    | `/users/:userId`  | Update user details| `{ "fullName", "email" }`     | `{ "message": "User updated successfully" }`                                       | `{ "message": "User not found" }`                      |

---

### Venues

| Method | Endpoint         | Description           | Authorization | Request Body                  | Response (Success)                | Response (Error)                    |
| ------ | ---------------- | --------------------- | ------------- | ----------------------------- | --------------------------------- | ----------------------------------- |
| GET    | `/venues`        | Get all venues        | Bearer Token  | (none)                        | `[{ "id", "name", "capacity", "location", "isAvailable" }]` | (none)                              |
| GET    | `/venues/:venueId` | Get a specific venue  | Bearer Token  | (none)                        | `{ "id", "name", "capacity", "location", "isAvailable" }` | `{ "message": "Venue not found" }`  |
| POST   | `/venues`        | Add a new venue       | Admin         | `{ "name", "capacity", "location" }` | `{ "message": "Venue added successfully" }` | `{ "message": "Invalid data" }`     |
| PUT    | `/venues/:venueId` | Update a venue        | Admin         | `{ "name", "capacity", "location" }` | `{ "message": "Venue updated successfully" }` | `{ "message": "Venue not found" }`  |
| DELETE | `/venues/:venueId` | Delete a venue        | Admin         | (none)                        | `{ "message": "Venue deleted successfully" }` | `{ "message": "Venue not found" }`  |

---

### Courses

| Method | Endpoint          | Description            | Authorization | Request Body                                     | Response (Success)                  | Response (Error)                     |
| ------ | ----------------- | ---------------------- | ------------- | ------------------------------------------------ | ----------------------------------- | ------------------------------------ |
| GET    | `/courses`        | Get all courses        | Bearer Token  | (none)                                           | `[{ "id", "name", "code", "instructor", "students", "creditHours" }]` | (none)                               |
| GET    | `/courses/:courseId`| Get a specific course  | Bearer Token  | (none)                                           | `{ "id", "name", "code", "instructor", "students", "creditHours" }` | `{ "message": "Course not found" }`  |
| POST   | `/courses`        | Add a new course       | Admin         | `{ "name", "code", "instructor", "creditHours" }` | `{ "message": "Course added successfully" }` | `{ "message": "Invalid data" }`      |
| PUT    | `/courses/:courseId`| Update a course        | Admin         | `{ "name", "code", "instructor", "creditHours" }` | `{ "message": "Course updated successfully" }` | `{ "message": "Course not found" }`  |
| DELETE | `/courses/:courseId`| Delete a course        | Admin         | (none)                                           | `{ "message": "Course deleted successfully" }` | `{ "message": "Course not found" }`  |

---

### Timetables

| Method | Endpoint               | Description                  | Authorization | Request Body | Response (Success)                                                              | Response (Error)                       |
| ------ | ---------------------- | ---------------------------- | ------------- | ------------ | ------------------------------------------------------------------------------- | -------------------------------------- |
| POST   | `/timetables/allocate-ai` | Generate timetable using AI    | Admin         | (none)       | `{ "status": "success", "timetable": [...] }`                                     | `{ "message": "Failed to allocate timetable" }` |
| GET    | `/timetables/:day`     | Get timetable for a day      | Bearer Token  | (none)       | `[{ "id", "course", "venue", "instructor", "students", "day", "startTime", "endTime" }]` | `{ "message": "No timetable found" }`   |
| GET    | `/timetables/id/:id`   | Get a specific timetable     | Bearer Token  | (none)       | `{ "id", "course", "venue", "instructor", "students", "day", "startTime", "endTime" }` | `{ "message": "Timetable not found" }`  |
| DELETE | `/timetables/:id`      | Delete a timetable entry     | Admin         | (none)       | `{ "message": "Timetable entry deleted successfully" }`                         | `{ "message": "Timetable not found" }`  |

---
