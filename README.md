# SQUASH Bug Tracking REST API

SQUASH is a robust, beginner-friendly bug tracking REST API built with Java 17 and Spring Boot 3.x for a university project-based learning assignment.

## Tech Stack
- **Java 17**
- **Spring Boot 3.3.5**
- **Spring Data JPA & Hibernate**
- **Spring Web & Validation**
- **MySQL Driver (mysql-connector-j)**
- **Lombok**

---

## Setup & Configuration

### 1. Database Setup
Ensure MySQL is running locally on port `3306`. Create your configuration file:
- Copy `src/main/resources/application.properties.example` to `src/main/resources/application.properties`
- Update your database username and password in `application.properties`:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/squash_db?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=YOUR_PASSWORD
```

### 2. Running the Application
Run the Spring Boot application using Maven:
```bash
mvn spring-boot:run
```
The application starts at `http://localhost:8080/api/issues`. On first startup, it automatically seeds 5 sample issues if the database is empty.

---

## Status Transition Workflow

```
[ OPEN ] --------> ( IN_PROGRESS ) <--------+
     \                  |                   |
      \                 v                   |
       +---------> ( RESOLVED ) ------------+
                        |
                        v
                    [ CLOSED ]
```
- **Allowed Transitions**:
  - `OPEN` -> `IN_PROGRESS`
  - `IN_PROGRESS` -> `RESOLVED`
  - `IN_PROGRESS` -> `OPEN`
  - `RESOLVED` -> `CLOSED`
  - `RESOLVED` -> `OPEN` (Reopen)
- Any other transition throws an `InvalidStatusTransitionException` returning **409 Conflict**.
- Setting status to `RESOLVED` automatically sets `resolvedAt` timestamp. Reopening clears `resolvedAt`.

---

## API Endpoints Reference

| Method | Endpoint | Description | Request Body / Params | Success Status |
| :--- | :--- | :--- | :--- | :--- |
| **POST** | `/api/issues` | Create new issue (status forced to OPEN) | JSON (IssueRequest) | 201 Created |
| **GET** | `/api/issues` | List / filter issues | Optional query params: `status`, `severity`, `assignee` | 200 OK |
| **GET** | `/api/issues/{id}` | Get issue by ID | Path variable `id` | 200 OK |
| **PUT** | `/api/issues/{id}` | Update issue details | JSON (IssueRequest) | 200 OK |
| **DELETE** | `/api/issues/{id}` | Delete issue | Path variable `id` | 204 No Content |
| **PATCH** | `/api/issues/{id}/status` | Update issue status | JSON (`{ "status": "IN_PROGRESS" }`) | 200 OK |
| **PATCH** | `/api/issues/{id}/assign` | Assign issue | JSON (`{ "assignee": "Name" }`) | 200 OK |
| **GET** | `/api/issues/severity/{severity}` | Get all issues by severity | Path variable `severity` | 200 OK |
| **GET** | `/api/issues/search?keyword=...` | Case-insensitive search on title/desc | Query param `keyword` | 200 OK |
| **GET** | `/api/issues/stats` | Get count statistics by status/severity | None | 200 OK |

---

## Example Request & Response

### 1. Create Issue (`POST /api/issues`)
**Request Body:**
```json
{
  "title": "Null pointer in payment gateway",
  "description": "Checkout crashes when coupon code is invalid.",
  "severity": "HIGH",
  "priority": "P1",
  "reporter": "Alice"
}
```
**Response (`201 Created`):**
```json
{
  "id": 6,
  "title": "Null pointer in payment gateway",
  "description": "Checkout crashes when coupon code is invalid.",
  "severity": "HIGH",
  "priority": "P1",
  "status": "OPEN",
  "assignee": null,
  "reporter": "Alice",
  "createdAt": "2026-11-13T12:00:00",
  "updatedAt": "2026-11-13T12:00:00",
  "resolvedAt": null
}
```

---

## Postman Collection
A complete Postman collection covering all endpoints, sample payloads, and error scenarios is available at `squash.postman_collection.json`.
