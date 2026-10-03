# Ezzewash Notification Service

Notification Service is a Spring Boot microservice responsible for creating, storing, retrieving, and sending notifications for the Ezzewash platform.

The current version supports email notifications and integrates with the Auth Service to validate users.

## Features

* Create notifications
* Retrieve a notification by ID
* Retrieve all notifications for a user
* Send email notifications
* Track notification status
* Track notification creation, update, and sent timestamps
* Store failure reasons when email delivery fails
* Support generic references such as orders, payments, users, or other services
* JWT-based authentication
* Role-based authorization
* Auth Service integration for user validation
* MySQL persistence
* Docker and Docker Compose support
* Request validation and centralized exception handling

## Technology Stack

* Java 25
* Spring Boot
* Spring Web
* Spring Data JPA
* Spring Security
* Spring OAuth2 Resource Server
* JWT
* Jakarta Validation
* Spring Mail
* MySQL 8.4
* Maven
* Docker
* Docker Compose
* Lombok

## Service Port

```text
3006
```

## Database

```text
Database: ezzewash_notification
Database: MySQL 8.4
Docker MySQL Port: 3309
MySQL Container Port: 3306
```

The application connects to MySQL inside Docker using:

```text
jdbc:mysql://mysql:3306/ezzewash_notification
```

## Notification Types

The service currently defines:

```text
EMAIL
SMS
PUSH
```

Only `EMAIL` notifications are currently supported for sending.

`SMS` and `PUSH` are reserved for future implementation.

## Notification Status

Notifications can have the following statuses:

```text
PENDING
SENT
FAILED
```

### PENDING

The notification has been created but has not been sent.

### SENT

The notification was successfully sent.

### FAILED

An attempt to send the notification failed. The failure reason is stored with the notification.

## Notification Data

Each notification contains:

```text
id
userId
type
recipient
subject
message
status
referenceType
referenceId
failureReason
sentAt
createdAt
updatedAt
```

`referenceType` and `referenceId` can be used to associate a notification with another business operation.

Examples:

```text
referenceType: USER
referenceId: <user-id>
```

```text
referenceType: ORDER
referenceId: <order-id>
```

```text
referenceType: PAYMENT
referenceId: <payment-id>
```

## API Endpoints

Base URL:

```text
http://localhost:3006
```

### Create Notification

```http
POST /api/notifications
```

Request:

```json
{
  "userId": "6ab675323d43084492f804b7",
  "type": "EMAIL",
  "recipient": "user@example.com",
  "subject": "Ezzewash Notification",
  "message": "Your notification message.",
  "referenceType": "ORDER",
  "referenceId": "order-id"
}
```

Response:

```json
{
  "id": "notification-id",
  "userId": "6ab675323d43084492f804b7",
  "type": "EMAIL",
  "recipient": "user@example.com",
  "subject": "Ezzewash Notification",
  "message": "Your notification message.",
  "status": "PENDING",
  "referenceType": "ORDER",
  "referenceId": "order-id",
  "failureReason": null,
  "sentAt": null,
  "createdAt": "2026-10-03T12:00:00",
  "updatedAt": "2026-10-03T12:00:00"
}
```

A normal user can create a notification only for themselves.

Admins can create notifications for other users.

The service also validates the user through the Auth Service.

### Get Notification

```http
GET /api/notifications/{notificationId}
```

Returns a notification by its UUID.

Normal users can only retrieve their own notifications.

Admins can retrieve notifications belonging to other users.

### Get User Notifications

```http
GET /api/notifications/user/{userId}
```

Returns all notifications belonging to the specified user.

Normal users can only access their own notifications.

Admins can access notifications for other users.

### Send Notification

```http
POST /api/notifications/{notificationId}/send
```

Currently, this endpoint supports:

```text
EMAIL
```

When sending succeeds:

```text
status = SENT
sentAt = current timestamp
failureReason = null
```

When sending fails:

```text
status = FAILED
failureReason = error message
```

A notification that has already been sent cannot be sent again.

## Authentication

The service uses JWT authentication.

JWT tokens are issued by the Auth Service.

The Notification Service reads the following JWT claims:

```text
userId
role
```

Supported roles include:

```text
USER
ADMIN
SUPER_ADMIN
```

`ADMIN` and `SUPER_ADMIN` have administrative access to notification operations.

Regular users are restricted to their own notifications.

## Auth Service Integration

The Notification Service communicates with the Auth Service when creating a notification.

Auth Service endpoint:

```http
GET /api/v1/users/{userId}
```

The user's access token is forwarded to the Auth Service.

The Auth Service is configured through:

```properties
auth-service.url=${AUTH_SERVICE_URL:http://localhost:3001}
```

When running through Docker Compose, the Notification Service uses:

```text
http://host.docker.internal:3001
```

## Email Configuration

Email delivery currently uses Gmail SMTP.

The service uses Spring Boot's `JavaMailSender`.

Configuration properties:

```properties
spring.mail.host=${MAIL_HOST:smtp.gmail.com}
spring.mail.port=${MAIL_PORT:587}
spring.mail.username=${MAIL_USERNAME:}
spring.mail.password=${MAIL_PASSWORD:}
```

SMTP authentication and STARTTLS are enabled.

Email credentials should not be committed to the repository.

Use environment variables or a local `.env` file for credentials.

## Error Handling

The service provides centralized exception handling.

Common responses include:

```text
400 Bad Request
403 Forbidden
404 Not Found
409 Conflict
503 Service Unavailable
500 Internal Server Error
```

Validation errors return the individual field errors.

Example:

```json
{
  "status": 400,
  "message": "Validation failed",
  "errors": {
    "recipient": "Recipient must be a valid email address",
    "subject": "Subject is required"
  }
}
```

## Docker

The service uses a multi-stage Docker build.

The build stage uses:

```text
maven:3.9-eclipse-temurin-25
```

The runtime stage uses:

```text
eclipse-temurin:25-jre
```

The application exposes:

```text
3006
```

Build and start:

```text
docker compose up -d --build
```

Stop:

```text
docker compose down
```

View logs:

```text
docker compose logs notification-service
```

## Docker Compose

The Notification Service Compose setup contains:

```text
notification-service
mysql
```

MySQL uses:

```text
ezzewash-notification-mysql
```

The Notification Service uses:

```text
ezzewash-notification-service
```

The MySQL data is persisted using:

```text
notification_mysql_data
```

## Project Structure

```text
notification-service/
├── src/
│   └── main/
│       ├── java/
│       │   └── com/
│       │       └── notification_service/
│       │           ├── client/
│       │           ├── config/
│       │           ├── controller/
│       │           ├── dto/
│       │           │   ├── request/
│       │           │   └── response/
│       │           ├── entity/
│       │           ├── enums/
│       │           ├── exception/
│       │           ├── repository/
│       │           └── service/
│       └── resources/
│           └── application.properties
├── Dockerfile
├── docker-compose.yml
├── pom.xml
└── README.md
```

## Current Scope

The current Notification Service is intentionally kept simple.

It provides the core notification functionality required by the Ezzewash system without introducing unnecessary asynchronous infrastructure.

Currently implemented:

```text
Notification creation
Notification retrieval
User notification listing
Email delivery
Notification status tracking
JWT authentication
Authorization
Auth Service user validation
Docker support
```

## Future Enhancements

The following features can be added later if required:

* Mark notification as read
* Mark notification as unread
* Soft-delete notifications
* SMS notifications
* Push notifications
* Notification templates
* Event-driven notification processing
* Kafka integration
* Asynchronous notification processing
* Automatic notification creation from Order Service
* Automatic notification creation from Payment Service
* Automatic notification creation from Rider Service
* Automatic notification creation from Auth Service

Kafka and event-driven notification processing are intentionally not part of the current V1 implementation.

## Service Integration

The Notification Service can eventually receive business events from other Ezzewash services.

Examples:

```text
Auth Service
    ↓
User registration / email verification
    ↓
Notification Service
    ↓
Email
```

```text
Order Service
    ↓
Order created / order status changed
    ↓
Notification Service
    ↓
Email
```

```text
Payment Service
    ↓
Payment success / payment failure
    ↓
Notification Service
    ↓
Email
```

```text
Rider Service
    ↓
Rider assignment / delivery updates
    ↓
Notification Service
    ↓
Email
```

These integrations are planned for the broader Ezzewash system and are not required for the current V1 service.

## Security Notes

Do not commit:

```text
Gmail passwords
Gmail App Passwords
JWT secrets
Production database passwords
```

Keep sensitive configuration in environment variables or another secure configuration mechanism.

## Current Status

Notification Service V1 is complete and ready for integration with the other Ezzewash services.

The next system-level step is API Gateway integration, followed by service-to-service integration and, where useful, Kafka-based asynchronous events.
