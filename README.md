# EzzeWash Microservices

EzzeWash is a scalable, production-oriented microservices backend for a laundry and wash-service platform.

The system is designed around independently deployable services with clear domain boundaries, service-owned data, secure authentication, containerized infrastructure, and asynchronous communication where appropriate.

> **Current status:** `auth-service`, `catalog-service`, and `order-service` are implemented and Dockerized. `rider-service`, `payment-service`, `notification-service`, and `api-gateway` are planned/in development.

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
              ┌────────────────────┼─────────────────────┐
              │                    │                     │
              ▼                    ▼                     ▼
       ┌─────────────┐      ┌─────────────┐      ┌─────────────┐
       │    Auth     │      │   Catalog   │      │    Order    │
       │   Service   │      │   Service   │      │   Service   │
       └──────┬──────┘      └──────┬──────┘      └──────┬──────┘
              │                    │                     │
              ▼                    ▼                     ▼
          MongoDB              MongoDB               MongoDB
              │                    │                     │
              ▼                    ▼                     ▼
            Redis                Redis                 Redis


                         ┌─────────────┐
                         │ Rider       │
                         │ Service     │
                         └──────┬──────┘
                                │
                       ┌────────┴────────┐
                       ▼                 ▼
                     MySQL             Redis
                                         │
                                         │ Live GPS
                                         ▼

                         ┌─────────────┐
                         │   Payment   │
                         │   Service   │
                         └──────┬──────┘
                                │
                              MySQL


                         ┌─────────────┐
                         │ Notification│
                         │   Service   │
                         └──────┬──────┘
                                │
                              MySQL


                    ┌──────────────────────┐
                    │        Kafka         │
                    │  Async Event Bus     │
                    └──────────────────────┘
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
├── catalog-service/
│   ├── src/
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── README.md
│
├── order-service/
│   ├── src/
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── README.md
│
├── rider-service/
│
├── payment-service/
│
├── notification-service/
│
├── api-gateway/
│
├── docker-compose.yml
│
└── README.md
```

Each service owns its source code, configuration, data access, business logic, API, tests, Docker configuration, and service-level documentation.

---

# Services

## 1. Auth Service

**Status:** ✅ Implemented and Dockerized

**Technology:**

```text
Node.js
TypeScript
MongoDB
Redis
```

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
* MongoDB integration
* Redis integration

Auth Service is the source of truth for:

```text
userId
name
phone
email
password
role
```

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

## 2. Catalog Service

**Status:** ✅ Implemented and Dockerized

**Technology:**

```text
Node.js
TypeScript
MongoDB
Redis
```

Responsible for the laundry catalog and branch management.

Responsibilities include:

* Branches
* Branch activation/deactivation
* Laundry services
* Items
* Service-item combinations
* Service-item pricing
* Service activation/deactivation
* Offers and discounts
* Reviews
* Branch memberships
* Branch-specific administration
* Catalog validation

The Catalog Service is the source of truth for:

```text
Branches
Services
Items
Service-item combinations
Pricing
Offers
Branch memberships
```

Order Service communicates with Catalog Service to validate branch and catalog information.

Documentation:

```text
catalog-service/README.md
```

Local API:

```text
http://localhost:3002
```

Docker:

```text
catalog-service → :3002
catalog-mongodb  → :27018
catalog-redis    → :6380
```

---

## 3. Order Service

**Status:** ✅ Implemented and Dockerized

**Technology:**

```text
Node.js
TypeScript
MongoDB
Redis
```

Responsible for the laundry order domain.

Current responsibilities:

* Order creation
* Order items
* Order status management
* Order lifecycle
* Pickup scheduling
* Delivery scheduling
* Order history
* User order pagination
* Order details
* Order cancellation
* Rider assignment
* Branch validation
* Catalog validation
* Price snapshotting
* Branch capacity management
* Pickup capacity
* Delivery capacity
* Atomic slot booking
* Overbooking protection
* Booking rollback
* Capacity release on cancellation

### Order Lifecycle

```text
PENDING
   ↓
CONFIRMED
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

Cancellation is supported from appropriate states:

```text
PENDING → CANCELLED

CONFIRMED → CANCELLED
```

### Capacity Management

Order Service owns booking capacity.

Each branch can have separate pickup and delivery capacity:

```text
PICKUP

10:00 → capacity 100 → booked 72
11:00 → capacity 100 → booked 100


DELIVERY

16:00 → capacity 50 → booked 31
17:00 → capacity 50 → booked 50
```

Capacity is booked atomically to prevent race-condition overbooking.

If order creation fails after capacity reservation, the service releases the reserved slots.

When an order is cancelled, its pickup and delivery reservations are released.

### Rider Assignment

Order Service stores:

```text
riderId
```

for an assigned order.

Rider operational data and rider availability belong to Rider Service.

Documentation:

```text
order-service/README.md
```

Local API:

```text
http://localhost:3003
```

Docker:

```text
order-service → :3003
order-mongodb  → :27019
order-redis    → :6381
```

---

## 4. Rider Service

**Status:** 🚧 Planned / In development

**Technology:**

```text
Spring Boot
MySQL
Redis
```

Rider Service owns rider operational functionality.

Responsibilities:

* Rider operational profile
* Rider activation/deactivation
* Rider online/offline status
* Rider availability
* Rider assignments
* Pickup workflow
* Delivery workflow
* Live GPS location
* Rider rating
* Delivery statistics
* Rider earnings
* Cash collection
* Cash in hand
* Cash submission
* Settlement history

### Rider Profile

```text
id
userId
isActive
isOnline
rating
totalDeliveries
totalEarnings
cashInHand
createdAt
updatedAt
```

Auth Service remains the source of truth for the rider's identity and account information.

### Rider Assignment

```text
ASSIGNED
   ↓
ACCEPTED
   ↓
PICKUP_STARTED
   ↓
PICKED_UP
   ↓
DELIVERY_STARTED
   ↓
DELIVERED
```

Other states:

```text
REJECTED
CANCELLED
```

### Live Location

Rider GPS data will be stored in Redis:

```text
rider:{riderId}:location
```

Example data:

```text
latitude
longitude
updatedAt
```

GPS updates will not be written to MySQL every few seconds.

Rider Service will own live location functionality and can later provide realtime updates through WebSocket/realtime communication.

---

## 5. Payment Service

**Status:** 🚧 Planned

**Technology:**

```text
Spring Boot
MySQL
```

Responsible for payment-related operations.

Supported payment methods:

```text
COD
STRIPE
```

Payment statuses:

```text
PENDING
PAID
FAILED
REFUNDED
```

Responsibilities:

* Payment creation
* Payment status tracking
* COD payment handling
* Stripe integration
* Stripe webhook processing
* Payment transaction records
* Refund handling

### Stripe Flow

```text
Order Service
      │
      ▼
Payment Service
      │
      ▼
Stripe
      │
      ▼
Stripe Webhook
      │
      ▼
Payment Service
      │
      ▼
Payment = PAID
```

The frontend must not be trusted to mark a Stripe payment as paid.

### COD Flow

```text
Customer places COD order
          ↓
Rider collects cash
          ↓
Rider Service records collection
          ↓
Payment Service records payment
          ↓
Payment = PAID
```

Payment business logic remains isolated from authentication and order persistence.

---

## 6. Notification Service

**Status:** 🚧 Planned

**Technology:**

```text
Spring Boot
MySQL
```

Responsible for system and customer notifications.

Planned channels:

```text
PUSH
EMAIL
SMS
```

Initial implementation can focus on push notifications.

Possible events:

```text
OrderCreated
OrderConfirmed
PickupScheduled
OrderPickedUp
OrderReady
OrderOutForDelivery
OrderDelivered
OrderCancelled
PaymentCompleted
PasswordResetRequested
```

Notification Service will consume relevant events and deliver notifications without coupling notification logic directly to the Order or Payment services.

---

## 7. API Gateway

**Status:** 🚧 Planned

**Technology:**

```text
Spring Boot
Spring Cloud Gateway
```

The API Gateway will provide a single entry point for clients.

Planned routes:

```text
/api/v1/auth/**          → Auth Service
/api/v1/branches/**      → Catalog Service
/api/v1/services/**      → Catalog Service
/api/v1/items/**         → Catalog Service
/api/v1/orders/**        → Order Service
/api/v1/capacity-slots/** → Order Service
/api/v1/riders/**        → Rider Service
/api/v1/payments/**      → Payment Service
/api/v1/notifications/** → Notification Service
```

Responsibilities:

* Request routing
* JWT handling
* CORS
* Rate limiting
* Request ID
* Central API entry point

---

# Data Ownership

Each service owns its own data.

```text
User account
Password
Role
Sessions
    ↓
Auth Service
    ↓
MongoDB


Branch
Service
Item
Pricing
Offers
Memberships
    ↓
Catalog Service
    ↓
MongoDB


Order
Order Item
Capacity
Pickup Slot
Delivery Slot
Rider assignment reference
    ↓
Order Service
    ↓
MongoDB


Rider profile
Rider availability
Rider assignments
Rider ratings
Rider cash
Rider settlements
Rider earnings
    ↓
Rider Service
    ↓
MySQL


Payment
Transactions
Refunds
    ↓
Payment Service
    ↓
MySQL


Notifications
Notification preferences
    ↓
Notification Service
    ↓
MySQL
```

Services should never directly access another service's database.

---

# Infrastructure

## MongoDB

MongoDB is used by:

```text
Auth Service
Catalog Service
Order Service
```

Each service owns its own MongoDB data.

Example:

```text
auth-service
    ↓
Auth MongoDB

catalog-service
    ↓
Catalog MongoDB

order-service
    ↓
Order MongoDB
```

---

## MySQL

MySQL will be used by the Spring Boot services:

```text
Rider Service
Payment Service
Notification Service
```

Each service will have its own data boundary.

---

## Redis

Redis is used for short-lived, high-speed, or realtime state.

Current uses include:

### Auth Service

* OTP storage
* Refresh-token/session state
* Revoked refresh tokens
* Rate limiting

### Catalog Service

* Redis-backed service infrastructure

### Order Service

* Redis-backed service infrastructure

### Rider Service

* Live GPS location
* Realtime rider state where appropriate

---

## Kafka

**Status:** 🚧 Planned

Kafka will be introduced for asynchronous event-driven communication where it provides a clear architectural benefit.

Possible events:

```text
OrderCreated
OrderConfirmed
OrderCancelled
OrderPickedUp
OrderReady
OrderDelivered
PaymentCompleted
NotificationRequested
```

Example:

```text
Order Service
      │
      ▼
    Kafka
      │
      ├──────────────► Payment Service
      │
      └──────────────► Notification Service
```

Kafka is not required for every synchronous operation.

---

# Service Communication

The system uses two primary communication patterns.

## Synchronous Communication

HTTP/REST is used when a service needs an immediate response.

Example:

```text
Order Service
      │
      │ HTTP
      ▼
Catalog Service
```

For example, Order Service can request branch and service-item information from Catalog Service before creating an order.

## Asynchronous Communication

Kafka will be used for events that do not require an immediate response.

Example:

```text
Order Service
      │
      ▼
    Kafka
      │
      ▼
Notification Service
```

This keeps synchronous request flows simple while allowing independent event processing.

---

# Docker

Docker is used to provide consistent development and deployment environments.

Current services are individually Dockerized.

Example:

```text
┌─────────────────────────────────────────────┐
│              Docker Environment             │
│                                             │
│  Auth Service      → MongoDB + Redis        │
│                                             │
│  Catalog Service   → MongoDB + Redis        │
│                                             │
│  Order Service     → MongoDB + Redis        │
│                                             │
│  Rider Service     → MySQL + Redis          │
│                                             │
│  Payment Service   → MySQL                  │
│                                             │
│  Notification      → MySQL                  │
│                                             │
└─────────────────────────────────────────────┘
```

Inside Docker, services communicate using Docker service names.

Example:

```text
mongodb:27017
redis:6379
auth-service:3001
```

From the host machine:

```text
localhost:3001
localhost:3002
localhost:3003
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

Recreate a service:

```bash
docker compose up -d --force-recreate order-service
```

Build an image:

```bash
docker build -t ezzewash/order-service:1.0 ./order-service
```

---

# Persistence

Docker uses named volumes for persistent data.

Examples:

```text
auth_mongodb_data
catalog_mongodb_data
order_mongodb_data
redis_data
```

Removing containers normally does not remove named volumes.

```bash
docker compose down
```

removes containers but preserves named volume data.

Be careful with:

```bash
docker compose down -v
```

because it removes associated volumes and can delete persistent database data.

---

# Development

## Prerequisites

Recommended development tools:

* Node.js
* npm
* Java
* Maven
* Docker Desktop
* Git
* MongoDB knowledge
* MySQL knowledge
* Redis knowledge

Kafka will be required when event-driven communication is introduced.

---

# Technology Strategy

The project intentionally uses two technology stacks.

## Node.js + TypeScript

Used for:

```text
Auth Service
Catalog Service
Order Service
```

These services use:

```text
Node.js
TypeScript
MongoDB
Redis
```

## Spring Boot + MySQL

Used for:

```text
Rider Service
Payment Service
Notification Service
```

The API Gateway will also use:

```text
Spring Boot
Spring Cloud Gateway
```

This architecture also provides practical experience with both Node.js/TypeScript and Spring Boot ecosystems.

---

# Local Development

Each service can be developed independently.

Example:

```bash
cd auth-service
npm install
npm run dev
```

For Spring Boot services:

```bash
cd rider-service
./mvnw spring-boot:run
```

The exact commands may vary depending on the service implementation.

---

# Environment Variables

Environment files are service-specific.

Example:

```text
auth-service/.env
catalog-service/.env
order-service/.env
rider-service/.env
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

Each service should provide its own API documentation.

Current Auth Service:

```text
http://localhost:3001/api-docs
```

Future services should expose their own Swagger/OpenAPI documentation.

Example:

```text
Auth Service       → :3001
Catalog Service    → :3002
Order Service      → :3003
Rider Service      → future port
Payment Service    → future port
Notification       → future port
API Gateway        → future port
```

The exact ports may evolve as development progresses.

---

# Security

Security is treated as a cross-service architectural concern.

Current Auth Service security mechanisms include:

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

Future security work includes:

* Service-to-service authentication
* Internal API authorization
* Secret management
* Secure inter-service communication
* Gateway-level security
* Production deployment controls

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

The role hierarchy represents administrative responsibility, while actual permissions are enforced by service-specific authorization rules.

## SUPER_ADMIN

Responsible for higher-level administration.

Can perform higher-level administrative operations such as:

* Managing users
* Managing riders
* Managing admins
* Creating admin accounts
* Creating rider accounts
* Activating/deactivating managed accounts

## ADMIN

Responsible for branch-level operational administration.

ADMIN access to branch-specific functionality is determined through Catalog Service branch memberships.

ADMIN capabilities include operations such as:

* Managing branch operations
* Managing riders
* Creating riders
* Managing orders
* Managing branch capacity
* Managing branch-specific catalog operations

An ADMIN cannot manage another ADMIN or SUPER_ADMIN through normal administrative operations.

## RIDER

Riders operate within rider-specific business functionality.

Rider functionality includes:

* Viewing rider profile
* Managing rider availability
* Accepting/rejecting assignments
* Pickup operations
* Delivery operations
* Updating live location
* Recording cash collection
* Managing rider operational state

Normal authenticated account operations remain owned by Auth Service.

## USER

Users are customer accounts.

Customer functionality includes:

* Managing their own profile
* Managing addresses
* Creating orders
* Viewing orders
* Cancelling eligible orders
* Viewing order status
* Using supported payment methods

---

# Testing

Each service should eventually have automated testing covering:

* Unit tests
* Service tests
* API/integration tests
* Validation tests
* Authorization tests
* Error handling
* Security boundaries
* Business rules

Important authorization boundaries include:

```text
USER
RIDER
ADMIN
SUPER_ADMIN
```

Each service should test only the permissions relevant to its domain.

---

# Recommended Development Workflow

For each new service:

```text
1. Define service responsibility
          ↓
2. Create project structure
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
10. Add API documentation
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

# Current Development Status

```text
✅ Auth Service
   ├── Authentication
   ├── Authorization
   ├── User management
   ├── Sessions
   ├── OTP/email
   ├── Roles
   ├── Swagger
   ├── MongoDB
   ├── Redis
   └── Docker

✅ Catalog Service
   ├── Branches
   ├── Services
   ├── Items
   ├── Service-item combinations
   ├── Pricing
   ├── Offers
   ├── Reviews
   ├── Branch memberships
   ├── Authorization
   ├── MongoDB
   ├── Redis
   └── Docker

✅ Order Service
   ├── Orders
   ├── Order items
   ├── Order lifecycle
   ├── Order cancellation
   ├── Pagination
   ├── Catalog validation
   ├── Price snapshots
   ├── Rider assignment
   ├── Pickup slots
   ├── Delivery slots
   ├── Capacity management
   ├── Atomic booking
   ├── Overbooking protection
   ├── Booking rollback
   ├── Cancellation capacity release
   ├── MongoDB
   ├── Redis
   └── Docker

🚧 Rider Service
   ├── Spring Boot
   ├── MySQL
   ├── Redis
   ├── Rider profile
   ├── Availability
   ├── Assignments
   ├── Live GPS
   ├── Ratings
   ├── Cash management
   └── Settlements

🚧 Payment Service
   ├── Spring Boot
   ├── MySQL
   ├── COD
   ├── Stripe
   ├── Transactions
   └── Refunds

🚧 Notification Service
   ├── Spring Boot
   ├── MySQL
   ├── Push notifications
   ├── Email
   └── SMS

🚧 API Gateway
   ├── Spring Boot
   ├── Spring Cloud Gateway
   ├── Routing
   ├── JWT handling
   ├── CORS
   └── Rate limiting

⬜ Kafka integration

⬜ Service-to-service authentication

⬜ Automated testing across services

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
       ┌──────────────────────────┼──────────────────────────┐
       │                          │                          │
       ▼                          ▼                          ▼
┌─────────────┐            ┌─────────────┐            ┌─────────────┐
│    Auth     │            │   Catalog   │            │    Order    │
│   Service   │            │   Service   │            │   Service   │
└──────┬──────┘            └──────┬──────┘            └──────┬──────┘
       │                          │                          │
    MongoDB                    MongoDB                    MongoDB
       │                          │                          │
     Redis                     Redis                      Redis


┌─────────────┐            ┌─────────────┐            ┌─────────────┐
│    Rider    │            │   Payment   │            │ Notification│
│   Service   │            │   Service   │            │   Service   │
└──────┬──────┘            └──────┬──────┘            └──────┬──────┘
       │                          │                          │
     MySQL                      MySQL                      MySQL
       │
     Redis
       │
   Live GPS


                         ┌─────────────┐
                         │    Kafka    │
                         └─────────────┘
```

The architecture will evolve as new requirements are implemented.

---

# Project Goal

The goal of EzzeWash is to provide a maintainable and scalable backend architecture suitable for a real-world laundry service platform.

The project emphasizes:

* Clear service boundaries
* Service-owned data
* Maintainable code
* Strong authentication and authorization
* Secure API design
* Containerized infrastructure
* Testable business logic
* Reliable inter-service communication
* Atomic business operations
* Event-driven architecture where appropriate
* Practical use of Node.js and Spring Boot
* MongoDB and MySQL
* Redis for high-speed and realtime state
* Production-oriented engineering practices

The final system is intended to provide practical experience building and integrating a multi-service backend rather than simply implementing isolated CRUD APIs.
