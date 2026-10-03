# EzzeWash Microservices

EzzeWash is a scalable, production-oriented microservices backend for a laundry and wash-service platform.

The system is designed around independently deployable services with clear domain boundaries, service-owned data, secure authentication, containerized infrastructure, and asynchronous communication where appropriate.

> **Current status:** All services (`auth-service`, `catalog-service`, `order-service`, `rider-service`, `payment-service`, `notification-service`, and `api_gateway`) are implemented and Dockerized!

---

# Architecture

The overall system is built around the following architecture:

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
                    │   (Planned/Future)   │
                    └──────────────────────┘
```

The exact gateway and service topology may evolve as development progresses.

---

# Repository Structure

```text
ezzewash-microservice/
├── auth-service/
├── catalog-service/
├── order-service/
├── rider-service/
├── payment-service/
├── notification-service/
├── api_gateway/
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

**Port:** `3001`

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

**Port:** `3002`

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

Cancellation is supported from appropriate states (e.g., `PENDING`, `CONFIRMED`). Capacity is automatically released on cancellation.

### Rider Assignment

Order Service stores `riderId` for an assigned order. Rider operational data and rider availability belong to Rider Service.

**Port:** `3003`

---

## 4. Rider Service

**Status:** ✅ Implemented and Dockerized

**Technology:**

```text
Spring Boot
Java
MySQL
Redis
```

Rider Service owns rider operational functionality. Auth Service remains the source of truth for the rider's identity and account information.

Responsibilities:

* Rider operational profile (vehicle info, rating, earnings, active/online status)
* Rider activation/deactivation
* Rider assignments (assignment retrieval and status updates)
* Rider availability
* JWT authentication
* Role-based authorization
* Auth Service integration

**Port:** `3004`

---

## 5. Payment Service

**Status:** ✅ Implemented and Dockerized

**Technology:**

```text
Spring Boot
Java
MySQL
```

Responsible for payment-related operations.

Supported payment methods:

* `COD`
* `ONLINE`

Payment statuses:

* `PENDING`
* `PAID`
* `FAILED`
* `CANCELLED`
* `REFUNDED`

Responsibilities:

* Payment creation
* Payment status tracking
* COD payment handling
* Payment transaction records
* Settlement functionality
* Refund handling
* Authentication/authorization

**Port:** `3005`

---

## 6. Notification Service

**Status:** ✅ Implemented and Dockerized

**Technology:**

```text
Spring Boot
Java
MySQL
SMTP Email
```

Responsible for system and customer notifications.

Supported channels:

* `EMAIL` (SMTP setup included)
* `SMS` (Enum support for future implementation)
* `PUSH` (Enum support for future implementation)

Statuses:

* `PENDING`
* `SENT`
* `FAILED`

Responsibilities:

* Notification creation
* Notification retrieval (including user notification retrieval)
* Sending notifications (Email delivery)
* Read/Unread tracking (`isRead` functionality)
* Authentication/authorization
* Validation

**Port:** `3006`

---

## 7. API Gateway

**Status:** ✅ Implemented and Dockerized

**Technology:**

```text
Spring Boot WebFlux
Spring Cloud Gateway
```

The API Gateway provides a single entry point for clients.

Currently configured routes:

```text
/api/v1/users/**                 → Auth Service
/api/v1/branches/**              → Catalog Service
/api/v1/services/**              → Catalog Service
/api/v1/items/**                 → Catalog Service
/api/v1/service-items/**         → Catalog Service
/api/v1/offers/**                → Catalog Service
/api/v1/reviews/**               → Catalog Service
/api/v1/branch-memberships/**    → Catalog Service
/api/v1/orders/**                → Order Service
/api/v1/capacity-slots/**        → Order Service
/api/v1/internal/**              → Order Service
/api/v1/riders/**                → Rider Service
/api/v1/rider-assignments/**     → Rider Service
/api/payments/**                 → Payment Service
/api/payment-settlements/**      → Payment Service
/api/notifications/**            → Notification Service
```

Responsibilities:

* Request routing
* CORS
* Health endpoint (`/actuator/health`)

**Port:** `3000`

---

# Data Ownership

Each service owns its own data. Services do not directly access another service's database. Synchronous communication is handled via HTTP REST APIs.

| Service              | Database | Additional Infrastructure |
| -------------------- | -------- | ------------------------- |
| Auth Service         | MongoDB  | Redis                     |
| Catalog Service      | MongoDB  | Redis                     |
| Order Service        | MongoDB  | Redis                     |
| Rider Service        | MySQL    | Redis                     |
| Payment Service      | MySQL    | None                      |
| Notification Service | MySQL    | SMTP (Email)              |
| API Gateway          | None     | None                      |

---

# Ports

| Service              | Port |
| -------------------- | ---- |
| **API Gateway**      | 3000 |
| **Auth Service**     | 3001 |
| **Catalog Service**  | 3002 |
| **Order Service**    | 3003 |
| **Rider Service**    | 3004 |
| **Payment Service**  | 3005 |
| **Notification Service** | 3006 |

---

# Docker Architecture

Each individual service is containerized with its own `Dockerfile` and `docker-compose.yml` to spin up its required databases and infrastructure (e.g., MySQL, MongoDB, Redis).

To run a specific service, navigate to its directory and run its `docker-compose` command.

*Note: Root-level docker-compose integration across all services is currently planned as a future improvement.*

---

# API Gateway Health

The API Gateway exposes a health endpoint to verify it is running:

```text
GET http://localhost:3000/actuator/health
```

Expected response:

```json
{
  "status": "UP"
}
```

---

# Security

### Currently Implemented

* JWT (JSON Web Tokens)
* Role-based authorization (`USER`, `RIDER`, `ADMIN`, `SUPER_ADMIN`)
* Password hashing (bcrypt)
* OTP-based verification
* Rate limiting (Node.js services)
* Helmet/CORS (Node.js services)
* Spring Security (Spring Boot services)
* Validation schemas

### Future Security Improvements

* Gateway JWT validation
* Gateway Redis rate limiting
* Service-to-service authentication
* Secret management

---

# Current Development Status

✅ Auth Service
✅ Catalog Service
✅ Order Service
✅ Rider Service
✅ Payment Service
✅ Notification Service
✅ API Gateway

### Unfinished/Future Work

⬜ Kafka integration (Event-driven asynchronous communication)
⬜ Gateway JWT validation & rate limiting
⬜ Service-to-service authentication
⬜ Root-level Docker Compose integration
⬜ Stripe / External Payment Provider actual integration
⬜ SMS / Push Notification integrations (currently supports Email)
⬜ Automated cross-service testing
⬜ CI/CD
⬜ Production deployment
