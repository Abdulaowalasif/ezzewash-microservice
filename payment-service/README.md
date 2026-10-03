# Ezzewash Payment Service

Payment Service is a Spring Boot microservice responsible for managing payment records and payment processing for the Ezzewash platform.

The current version provides payment creation, retrieval, status management, and integration with the Order Service, Rider Service, and Auth Service.

## Features

* Create payment records
* Retrieve payment by ID
* Retrieve payments by order
* Retrieve payments by user
* Process payments
* Track payment status
* Store payment method
* Store transaction information
* Handle payment failures
* Integrate with Order Service
* Integrate with Rider Service
* Integrate with Auth Service
* JWT-based authentication
* Role-based authorization
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
* MySQL 8.4
* Maven
* Docker
* Docker Compose
* Lombok

## Service Port

```text
3005
```

## Database

```text
Database: ezzewash_payment
Database: MySQL 8.4
Docker MySQL Port: 3308
MySQL Container Port: 3306
```

The application connects to MySQL inside Docker using:

```text
jdbc:mysql://mysql:3306/ezzewash_payment
```

## Payment Status

Payments use the following statuses:

```text
PENDING
SUCCESS
FAILED
```

### PENDING

The payment record has been created but payment processing has not completed.

### SUCCESS

The payment was successfully processed.

### FAILED

Payment processing failed.

## Payment Methods

The payment service supports payment methods defined by the service.

Examples can include:

```text
CASH
CARD
MOBILE_BANKING
```

The exact available values should match the current `PaymentMethod` enum in the service.

## Payment Data

A payment contains information such as:

```text
id
orderId
userId
amount
paymentMethod
status
transactionId
failureReason
createdAt
updatedAt
```

The exact fields exposed by the API are defined by the current request and response DTOs.

## API Endpoints

Base URL:

```text
http://localhost:3005
```

### Create Payment

```http
POST /api/payments
```

Creates a payment record for an order.

The service validates the relevant order and user information through the configured service integrations.

### Get Payment

```http
GET /api/payments/{paymentId}
```

Returns a payment by its ID.

### Get Payment by Order

```http
GET /api/payments/order/{orderId}
```

Returns payment information associated with an order.

### Get User Payments

```http
GET /api/payments/user/{userId}
```

Returns payments associated with a user.

### Process Payment

```http
POST /api/payments/{paymentId}/process
```

Processes a pending payment.

A successful payment changes the status to:

```text
SUCCESS
```

A failed payment changes the status to:

```text
FAILED
```

The service prevents invalid payment state transitions.

## Authentication

The service uses JWT authentication.

JWT tokens are issued by the Auth Service.

The service uses the following JWT claims:

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

Regular users are restricted to their own payment information.

Administrative users can access payment information according to their authorization rules.

## Auth Service Integration

Payment Service communicates with the Auth Service when user information needs to be validated.

Configuration:

```properties
auth-service.url=${AUTH_SERVICE_URL:http://localhost:3001}
```

When running through the provided Docker Compose configuration:

```text
http://host.docker.internal:3001
```

The user's access token is forwarded when communicating with the Auth Service.

## Order Service Integration

Payment Service communicates with Order Service for order-related validation and payment operations.

Configuration:

```properties
order-service.url=${ORDER_SERVICE_URL:http://localhost:3003}
```

When running through Docker Compose:

```text
http://host.docker.internal:3003
```

The Order Service is the source of order information used by Payment Service.

Payment Service does not directly access the Order Service database.

## Rider Service Integration

Payment Service can communicate with Rider Service where rider/order-related payment information or validation is required.

Configuration:

```properties
rider-service.url=${RIDER_SERVICE_URL:http://host.docker.internal:3004}
```

Payment Service communicates with Rider Service through its API rather than accessing its database directly.

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

Validation errors return field-level validation messages.

Example:

```json
{
  "status": 400,
  "message": "Validation failed",
  "errors": {
    "orderId": "Order ID is required"
  }
}
```

## Docker

The service uses a multi-stage Docker build.

Build stage:

```text
maven:3.9-eclipse-temurin-25
```

Runtime stage:

```text
eclipse-temurin:25-jre
```

The application exposes:

```text
3005
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
docker compose logs payment-service
```

## Docker Compose

The Payment Service Compose setup contains:

```text
payment-service
mysql
```

MySQL container:

```text
ezzewash-payment-mysql
```

Payment Service container:

```text
ezzewash-payment-service
```

MySQL uses:

```text
ezzewash_payment
```

The MySQL data is persisted using:

```text
payment_mysql_data
```

## Project Structure

```text
payment-service/
├── src/
│   └── main/
│       ├── java/
│       │   └── com/
│       │       └── payment_service/
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

## Service Communication

The Payment Service follows the microservice architecture used by Ezzewash.

It does not directly access databases owned by other services.

Communication follows:

```text
Payment Service
      │
      ├──→ Auth Service
      │
      ├──→ Order Service
      │
      └──→ Rider Service
```

Each service owns its own database.

## Payment Flow

A typical payment flow is:

```text
Client
   ↓
Payment Service
   ↓
Validate authenticated user
   ↓
Validate order
   ↓
Create payment
   ↓
Process payment
   ↓
SUCCESS / FAILED
```

For a successful payment:

```text
Payment
   ↓
SUCCESS
   ↓
Transaction information stored
```

For a failed payment:

```text
Payment
   ↓
FAILED
   ↓
Failure reason stored
```

## Current Scope

The current Payment Service is intentionally kept simple and focuses on the core payment functionality required by Ezzewash.

Currently implemented:

```text
Payment creation
Payment retrieval
Order-based payment lookup
User-based payment lookup
Payment processing
Payment status tracking
Transaction information
Payment failure handling
JWT authentication
Authorization
Auth Service integration
Order Service integration
Rider Service integration
Docker support
```

## Future Enhancements

The following features can be added later if required:

* Real payment gateway integration
* Stripe integration
* SSLCommerz integration
* bKash integration
* Nagad integration
* Payment refunds
* Partial refunds
* Payment webhooks
* Payment reconciliation
* Payment retry handling
* Kafka payment events
* Automatic notification after payment success
* Automatic notification after payment failure

External payment gateway integration is not required for the current V1 implementation.

## Notification Integration

Payment Service can eventually integrate with Notification Service for payment-related notifications.

Examples:

```text
Payment Service
      ↓
PAYMENT_SUCCESS
      ↓
Notification Service
      ↓
Email
```

```text
Payment Service
      ↓
PAYMENT_FAILED
      ↓
Notification Service
      ↓
Email
```

These integrations can later be implemented through Kafka or direct service communication depending on the final system architecture.

## Security Notes

Do not commit sensitive values such as:

```text
JWT secrets
Database passwords
Payment gateway credentials
API keys
Webhook secrets
```

Use environment variables or another secure configuration mechanism for production deployments.

## Current Status

Payment Service V1 is complete for the current Ezzewash backend scope.

The remaining system-level work is integration through the API Gateway, followed by broader end-to-end service integration and optional event-driven communication.
