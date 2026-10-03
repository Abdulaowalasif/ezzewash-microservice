# Ezzewash Rider Service

Rider Service is a microservice responsible for managing riders and rider-related operations in the Ezzewash platform.

The current version provides rider management, rider availability, order assignment, and rider/order tracking functionality required by the Ezzewash backend.

## Features

* Create riders
* Retrieve rider information
* Update rider information
* Manage rider availability
* Assign orders to riders
* Retrieve rider assignments
* Update assignment status
* Retrieve rider assignments by rider
* Retrieve rider assignments by order
* JWT-based authentication
* Role-based authorization
* MongoDB persistence
* Docker and Docker Compose support
* Request validation
* Centralized exception handling

## Technology Stack

* Node.js
* TypeScript
* Express.js
* MongoDB
* Mongoose
* JWT
* Docker
* Docker Compose

## Service Port

```text
3004
```

## Database

```text
Database: Ezzewash Rider Database
Database: MongoDB
```

The Rider Service owns its own database and does not directly access databases belonging to other Ezzewash services.

## Rider

A rider represents a delivery person responsible for pickup and delivery operations.

Rider information includes details such as:

```text
id
userId
branchId
vehicle information
availability
status
createdAt
updatedAt
```

The exact fields are defined by the current Rider entity/model and DTOs.

## Rider Status

Riders can have operational states used by the service to determine their availability for assignments.

The exact values are defined by the current Rider status enum/model.

Typical rider states include:

```text
ACTIVE
INACTIVE
```

## Rider Availability

The service supports managing whether a rider is available for new assignments.

An available rider can be considered for order assignment.

An unavailable rider should not receive new assignments.

## API Endpoints

Base URL:

```text
http://localhost:3004
```

The exact endpoint paths should follow the current controller/router definitions in the service.

### Rider Management

The service provides endpoints for:

```text
Create rider
Get rider
Update rider
List riders
```

Rider management is intended to be controlled by administrative users.

### Rider Availability

The service provides functionality to:

```text
Set rider available
Set rider unavailable
Check rider availability
```

Availability is used when determining whether a rider can receive new orders.

### Order Assignment

The Rider Service manages the relationship between riders and orders.

A typical assignment contains information such as:

```text
riderId
orderId
assignment status
assignedAt
updatedAt
```

The service supports:

```text
Assign order to rider
Get assignment
Get assignments by rider
Get assignment by order
Update assignment status
```

## Assignment Flow

A typical rider assignment flow is:

```text
Order Service
      ↓
Rider Service
      ↓
Find available rider
      ↓
Assign order
      ↓
Rider accepts / assignment progresses
      ↓
Pickup
      ↓
Delivery
      ↓
Assignment completed
```

The Rider Service owns the rider-to-order assignment data.

## Authentication

The service uses JWT authentication.

JWT tokens are issued by the Auth Service.

The JWT contains:

```text
userId
role
```

Supported application roles include:

```text
USER
RIDER
ADMIN
SUPER_ADMIN
```

Administrative operations are restricted according to the role-based authorization rules implemented by the service.

## Authorization

Rider-related operations follow role-based access control.

Administrative users can manage riders and assignments according to the service's authorization rules.

Riders can access operations related to themselves and their assigned orders.

Regular users do not receive administrative rider-management access.

## Auth Service Integration

The Rider Service uses authentication information provided by the Auth Service through JWTs.

The Rider Service does not directly access the Auth Service database.

User identity is represented through the authenticated JWT information and the rider's associated `userId`.

## Order Service Integration

The Rider Service works with Order Service for order-related rider operations.

The Rider Service does not directly access the Order Service database.

Communication between the services is performed through service APIs.

A typical interaction is:

```text
Order Service
      ↓
Request rider assignment
      ↓
Rider Service
      ↓
Create assignment
```

## Error Handling

The service provides centralized error handling for common application errors.

Typical responses include:

```text
400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
409 Conflict
500 Internal Server Error
```

Validation errors return appropriate validation messages.

## Docker

The Rider Service supports Docker-based development and deployment.

The service uses Docker to package the application and MongoDB can be run through Docker Compose.

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
docker compose logs rider-service
```

## Docker Compose

The Rider Service Compose setup contains the application and its MongoDB infrastructure.

The service uses its own MongoDB database and does not share the database with other Ezzewash services.

## Project Structure

```text
rider-service/
├── src/
│   ├── config/
│   ├── controllers/
│   ├── dtos/
│   ├── exceptions/
│   ├── middlewares/
│   ├── models/
│   ├── repositories/
│   ├── routes/
│   ├── services/
│   └── app.ts
├── Dockerfile
├── docker-compose.yml
├── package.json
├── tsconfig.json
└── README.md
```

The exact structure may contain additional files according to the current implementation.

## Service Communication

The Rider Service follows the Ezzewash microservice architecture.

It owns its own database:

```text
Rider Service
      ↓
MongoDB
```

It does not directly access another service's database.

Service communication follows:

```text
Order Service
      ↓
Rider Service
      ↓
MongoDB
```

Authentication is based on JWTs issued by Auth Service.

## Rider Assignment

Rider assignment is one of the main responsibilities of the service.

A simplified flow is:

```text
Order
  ↓
Request rider
  ↓
Find available rider
  ↓
Assign rider
  ↓
Assignment created
  ↓
Rider handles pickup
  ↓
Rider handles delivery
  ↓
Assignment completed
```

The assignment record allows the system to track which rider is responsible for an order.

## Current Scope

The current Rider Service focuses on the core rider-management requirements of Ezzewash.

Currently implemented:

```text
Rider management
Rider retrieval
Rider updates
Rider availability
Order assignment
Assignment retrieval
Assignment status management
JWT authentication
Role-based authorization
MongoDB persistence
Docker support
```

The service is intentionally kept practical and does not introduce unnecessary infrastructure.

## Future Enhancements

The following features can be added later if required:

* Automatic rider selection
* Distance-based rider assignment
* Rider location tracking
* GPS integration
* Delivery route optimization
* Rider earnings
* Rider performance statistics
* Rider ratings
* Delivery proof
* Push notifications
* Kafka-based rider events
* Real-time rider tracking

These features are not required for the current V1 implementation.

## Notification Integration

Rider Service can later integrate with Notification Service for rider-related notifications.

Examples include:

```text
Rider Service
      ↓
RIDER_ASSIGNED
      ↓
Notification Service
      ↓
Email
```

```text
Rider Service
      ↓
DELIVERY_COMPLETED
      ↓
Notification Service
      ↓
Email
```

This integration can later be implemented through Kafka or direct service communication.

## Security Notes

Do not commit sensitive configuration such as:

```text
JWT secrets
Database credentials
API keys
Production environment variables
```

Use environment variables or another secure configuration mechanism for production deployments.

## Current Status

Rider Service V1 is complete for the current Ezzewash backend scope.

The remaining system-level work is integration through the API Gateway, followed by end-to-end communication between Order, Rider, Payment, and Notification Services and optional Kafka-based event integration.
