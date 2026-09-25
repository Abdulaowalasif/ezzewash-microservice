# EzzeWash Microservices

EzzeWash is a scalable, production-oriented microservices backend for a laundry and wash-service platform.

The system is designed around independently deployable services with clear domain boundaries, secure authentication, containerized infrastructure, and asynchronous communication where appropriate.

> **Current status:** `auth-service` is implemented and Dockerized. The remaining business services are being developed incrementally.

---

# Architecture

The overall system is planned around the following architecture:

```text
                           ┌───────────────────┐
                           │   Web / Mobile    │
                           │      Clients      │
                           └─────────┬─────────┘
                                     │
                                     ▼
                           ┌───────────────────┐
                           │    API Gateway    │
                           └─────────┬─────────┘
                                     │
              ┌──────────────────────┼──────────────────────┐
              │                      │                      │
              ▼                      ▼                      ▼
       ┌─────────────┐       ┌─────────────┐       ┌─────────────┐
       │    Auth     │       │    Order    │       │   Payment   │
       │   Service   │       │   Service   │       │   Service   │
       └──────┬──────┘       └──────┬──────┘       └──────┬──────┘
              │                     │                     │
              │                     │                     │
              │                     └──────────┬──────────┘
              │                                │
              │                                ▼
              │                         ┌─────────────┐
              │                         │    Kafka    │
              │                         └──────┬──────┘
              │                                │
              │                                ▼
              │                       ┌─────────────────┐
              │                       │  Notification   │
              │                       │     Service     │
              │                       └─────────────────┘
              │
       ┌──────┴──────┐
       │             │
       ▼             ▼
   MongoDB         Redis
```

The exact gateway and service topology may evolve as development progresses.

---

# Repository Structure

```text
ezzewash-microservice/
│
├── auth-service/
│   ├── src/
│   ├── Dockerfile
│   ├── docker-compose.yml
│   ├── .dockerignore
│   └── README.md
│
├── order-service/
│
├── payment-service/
│
├── notification-service/
│
├── docker-compose.yml
│
└── README.md
```

Each microservice should eventually have:

* Its own source code
* Its own `package.json`
* Its own Dockerfile
* Its own environment configuration
* Its own tests
* Its own API documentation
* Its own service-level README

---

# Services

## 1. Auth Service

**Status:** ✅ Implemented and Dockerized

Responsible for:

* User registration
* Login/logout
* JWT access and refresh tokens
* Refresh-token rotation
* Refresh-token reuse detection
* Email verification
* OTP-based password recovery
* Password change/reset
* User profile management
* Profile-picture upload
* Address management
* Session management
* Role-based authorization
* USER / RIDER / ADMIN / SUPER_ADMIN roles
* Admin and rider creation
* User activation/deactivation
* Swagger/OpenAPI documentation
* Rate limiting
* Security middleware
* MongoDB and Redis integration

Documentation:

```text
auth-service/README.md
```

Local API:

```text
http://localhost:3001
```

Swagger:

```text
http://localhost:3001/api-docs
```

---

## 2. Order Service

**Status:** 🚧 Planned / In development

Responsible for the laundry order lifecycle.

Planned responsibilities include:

* Order creation
* Order status management
* Pickup scheduling
* Delivery scheduling
* Order history
* Customer order tracking
* Rider assignment
* Order cancellation
* Pricing information
* Order-related business rules

Example lifecycle:

```text
PLACED
  ↓
CONFIRMED
  ↓
PICKUP_ASSIGNED
  ↓
PICKED_UP
  ↓
PROCESSING
  ↓
READY
  ↓
OUT_FOR_DELIVERY
  ↓
DELIVERED
```

---

## 3. Payment Service

**Status:** 🚧 Planned

Responsible for payment-related operations.

Planned responsibilities:

* Payment creation
* Payment processing
* Payment status tracking
* Payment confirmation
* Refund handling
* Transaction records
* Payment provider integration

The payment service should remain isolated from authentication and order business logic.

---

## 4. Notification Service

**Status:** 🚧 Planned

Responsible for customer and system notifications.

Planned channels:

* Email
* SMS
* Push notifications

Possible events:

```text
OrderCreated
OrderConfirmed
PickupScheduled
OrderPickedUp
OrderReady
OrderOutForDelivery
OrderDelivered
PaymentCompleted
PasswordResetRequested
```

---

# Infrastructure

## MongoDB

MongoDB is used as the primary database for services that require document-oriented persistence.

Each service should ideally own its own data boundary instead of directly accessing another service's database.

Example:

```text
auth-service
    ↓
Auth MongoDB data

order-service
    ↓
Order MongoDB data
```

---

## Redis

Redis is used where short-lived or high-speed state is required.

The current auth-service uses Redis for:

* OTP storage
* Refresh-token/session state
* Revoked refresh tokens
* Rate limiting

Additional services may use Redis for caching or other temporary state.

---

## Kafka

**Status:** 🚧 Planned

Kafka will be introduced when asynchronous, event-driven communication becomes useful.

Examples:

```text
OrderCreated
PaymentCompleted
OrderCancelled
NotificationRequested
```

Example:

```text
order-service
      │
      ▼
    Kafka
      │
      ├──────────────► payment-service
      │
      └──────────────► notification-service
```

Kafka is not required for the initial implementation of every service. It will be introduced where asynchronous events provide a clear architectural benefit.

---

# Service Communication

The system will use two primary communication patterns.

## Synchronous communication

HTTP/REST can be used when one service needs an immediate response.

Example:

```text
order-service
      │
      │ HTTP
      ▼
auth-service
```

## Asynchronous communication

Kafka can be used for events that do not require an immediate response.

Example:

```text
order-service
      │
      ▼
    Kafka
      │
      ▼
notification-service
```

This separation keeps synchronous request flows simple while allowing asynchronous processing where appropriate.

---

# Docker

Docker is used to provide consistent development and deployment environments.

The auth-service currently runs with:

```text
auth-service
mongodb
redis
```

Example:

```text
┌──────────────────────────────────────┐
│           Docker Network             │
│                                      │
│  ┌────────────┐      ┌───────────┐  │
│  │   Auth     │─────►│ MongoDB   │  │
│  │  Service   │      └───────────┘  │
│  │   :3001    │                     │
│  │      │     │      ┌───────────┐  │
│  │      └─────┼─────►│   Redis   │  │
│  └────────────┘      └───────────┘  │
│                                      │
└──────────────────────────────────────┘
```

Inside Docker, services communicate using Docker service names.

For example:

```text
mongodb:27017
redis:6379
auth-service:3001
```

From the host machine:

```text
localhost:3001
```

---

# Docker Commands

Start services:

```bash
docker compose up -d
```

Check services:

```bash
docker compose ps
```

View logs:

```bash
docker compose logs -f
```

Stop services:

```bash
docker compose down
```

Recreate a service after rebuilding its image:

```bash
docker compose up -d --force-recreate auth-service
```

Build an image:

```bash
docker build -t ezzewash/auth-service:1.0 ./auth-service
```

---

# Persistence

Docker uses named volumes for persistent data.

Example:

```text
mongodb_data
redis_data
uploads
```

Removing containers does not normally remove named volumes.

For example:

```bash
docker compose down
```

stops and removes containers but preserves volume data.

Be careful with:

```bash
docker compose down -v
```

because it removes the associated volumes and therefore can delete persistent database data.

---

# Development

## Prerequisites

Recommended development tools:

* Node.js
* npm
* Docker Desktop
* Git
* MongoDB knowledge
* Redis knowledge

Kafka will be required once event-driven communication is introduced.

---

# Local Development

Each service can be developed independently.

Example:

```bash
cd auth-service
npm install
npm run dev
```

For local non-Docker development, dependencies such as MongoDB and Redis must be available locally and the environment configuration should use `localhost`.

---

# Environment Variables

Environment files are service-specific.

Example:

```text
auth-service/.env
order-service/.env
payment-service/.env
notification-service/.env
```

Never commit real secrets to Git.

Recommended practice:

```text
.env
.env.example
```

Commit:

```text
.env.example
```

Do not commit:

```text
.env
```

---

# API Documentation

Each service should provide its own Swagger/OpenAPI documentation.

Current auth-service documentation:

```text
http://localhost:3001/api-docs
```

Future services should expose their own documentation endpoints, for example:

```text
auth-service         → :3001/api-docs
order-service        → :3002/api-docs
payment-service      → :3003/api-docs
notification-service → :3004/api-docs
```

The exact ports may change as the system evolves.

---

# Security

Security is treated as a cross-service architectural concern.

Current auth-service security mechanisms include:

* JWT authentication
* Refresh-token rotation
* Refresh-token reuse detection
* Role-based authorization
* Rate limiting
* Helmet
* CORS
* Request IDs
* Input validation with Zod
* Protected administrative operations

Future microservice-level security will include:

* Service-to-service authentication
* Internal API authorization
* Secret management
* Secure inter-service communication
* Production-grade deployment controls

---

# Role Model

EzzeWash currently uses:

```text
SUPER_ADMIN
    ↓
ADMIN
    ↓
RIDER
    ↓
USER
```

### SUPER_ADMIN

Responsible for higher-level administration.

Can:

* Manage USERs
* Manage RIDERs
* Manage ADMINs
* Create ADMIN accounts
* Create RIDER accounts
* Activate/deactivate managed accounts

The SUPER_ADMIN account itself is protected from normal self-deactivation and self-deletion.

### ADMIN

Can:

* Manage USERs
* Manage RIDERs
* Create RIDER accounts
* Perform administrative operations allowed by the system

Cannot:

* Create ADMIN accounts
* Manage another ADMIN
* Manage SUPER_ADMIN

### RIDER

Riders operate within rider-specific business functionality.

They can still perform normal authenticated account operations such as:

* View profile
* Update profile
* Change password
* Manage their own sessions
* Manage their own account information

### USER

Customers use the normal customer-facing account functionality.

---

# Testing

Each service should have automated testing covering:

* Unit tests
* Service tests
* API/integration tests
* Validation tests
* Authorization tests
* Error handling
* Security boundaries

Auth-service should specifically test:

```text
USER
RIDER
ADMIN
SUPER_ADMIN
```

and verify that unauthorized role combinations are rejected.

---

# Recommended Development Workflow

For each new service:

```text
1. Define service responsibility
        ↓
2. Create modular project structure
        ↓
3. Define data model
        ↓
4. Implement repository
        ↓
5. Implement service/business logic
        ↓
6. Implement controller
        ↓
7. Implement routes
        ↓
8. Add validation
        ↓
9. Add authorization/security
        ↓
10. Add Swagger
        ↓
11. Add tests
        ↓
12. Dockerize
        ↓
13. Integrate with other services
        ↓
14. Introduce Kafka events where needed
```

---

# Current Development Roadmap

```text
✅ Auth Service
   ├── Authentication
   ├── Authorization
   ├── User management
   ├── Sessions
   ├── OTP/email
   ├── Roles
   ├── Swagger
   └── Docker

⬜ Automated auth-service tests
⬜ Order Service
⬜ Payment Service
⬜ Notification Service
⬜ Service-to-service authentication
⬜ Kafka integration
⬜ Central API Gateway
⬜ Observability
⬜ CI/CD
⬜ Production deployment
```

---

# Long-Term Architecture

The target system is a collection of independently deployable services:

```text
                        ┌──────────────────┐
                        │   Web / Mobile   │
                        └────────┬─────────┘
                                 │
                                 ▼
                        ┌──────────────────┐
                        │   API Gateway    │
                        └────────┬─────────┘
                                 │
          ┌──────────────────────┼────────────────────────┐
          │                      │                        │
          ▼                      ▼                        ▼
   ┌─────────────┐       ┌─────────────┐         ┌─────────────┐
   │    Auth     │       │    Order    │         │   Payment   │
   │   Service   │       │   Service   │         │   Service   │
   └──────┬──────┘       └──────┬──────┘         └──────┬──────┘
          │                     │                       │
          │                     └───────────┬───────────┘
          │                                 │
          │                                 ▼
          │                          ┌─────────────┐
          │                          │    Kafka    │
          │                          └──────┬──────┘
          │                                 │
          │                                 ▼
          │                       ┌──────────────────┐
          │                       │  Notification    │
          │                       │     Service      │
          │                       └──────────────────┘
          │
     ┌────┴────┐
     ▼         ▼
 MongoDB     Redis
```

The architecture will evolve as new requirements are implemented.

---

# Project Goal

The goal of EzzeWash is to provide a maintainable and scalable backend architecture suitable for a real-world laundry service platform.

The project emphasizes:

* Clean service boundaries
* Maintainable code
* Strong authentication and authorization
* Secure API design
* Containerized infrastructure
* Testable business logic
* Reliable inter-service communication
* Event-driven architecture where appropriate
* Production-oriented engineering practices
