# EzzeWash Order Service

Order Service for the EzzeWash laundry management system.

This service manages customer orders, order items, order lifecycle, branch capacity, pickup and delivery slots, and rider assignment.

## Technology

* Node.js
* TypeScript
* Express
* MongoDB
* Redis
* Zod
* JWT
* Docker
* Docker Compose

## Responsibilities

The Order Service owns:

* Orders
* Order items
* Order status lifecycle
* Pickup slots
* Delivery slots
* Branch booking capacity
* Capacity reservation
* Capacity release
* Rider assignment

The Order Service does not own:

* User accounts
* Passwords
* Roles
* Branches
* Services
* Items
* Service pricing
* Payments
* Rider profiles
* Rider GPS tracking
* Notifications

Those responsibilities belong to other services.

## Architecture

```text
Customer
   │
   ▼
API Gateway
   │
   ▼
Order Service
   │
   ├── MongoDB
   │
   ├── Redis
   │
   └── Catalog Service
```

The Order Service communicates with the Catalog Service to validate:

* Branches
* Services
* Items
* Service-item combinations
* Active catalog data
* Branch membership

## Project Structure

```text
order-service/
├── src/
│   ├── clients/
│   │   ├── catalog.client.ts
│   │   └── catalog.types.ts
│   │
│   ├── config/
│   │   └── config.ts
│   │
│   ├── controllers/
│   │   ├── capacity-slot.controller.ts
│   │   └── order.controller.ts
│   │
│   ├── infrastructure/
│   │   ├── database/
│   │   │   └── mongodb.ts
│   │   └── redis/
│   │
│   ├── middlewares/
│   │   ├── auth.middleware.ts
│   │   └── error.middleware.ts
│   │
│   ├── models/
│   │   ├── capacity-slot.model.ts
│   │   ├── order-item.model.ts
│   │   └── order.model.ts
│   │
│   ├── repositories/
│   │   ├── capacity-slot.repository.ts
│   │   ├── order-item.repository.ts
│   │   └── order.repository.ts
│   │
│   ├── routes/
│   │   ├── capacity-slot.routes.ts
│   │   └── order.routes.ts
│   │
│   ├── schemas/
│   │   ├── capacity-slot.schema.ts
│   │   └── order.schema.ts
│   │
│   ├── services/
│   │   ├── capacity-slot.service.ts
│   │   └── order.service.ts
│   │
│   ├── types/
│   │   └── express.d.ts
│   │
│   ├── utils/
│   │   └── app-error.ts
│   │
│   ├── app.ts
│   └── server.ts
│
├── Dockerfile
├── docker-compose.yml
├── package.json
├── package-lock.json
├── tsconfig.json
└── .env
```

## Environment Variables

```env
NODE_ENV=development
PORT=3003
MONGO_URI=mongodb://localhost:27019/ezzewash_orders
JWT_ACCESS_SECRET=your-existing-jwt-secret
ALLOWED_ORIGINS=http://localhost:3000
CATALOG_SERVICE_URL=http://localhost:3002
REDIS_URL=redis://localhost:6381
```

The JWT access secret must match the secret used by the Auth Service.

## Installation

Install dependencies:

```bash
npm install
```

## Development

Run the service in development mode:

```bash
npm run dev
```

## Build

Build the TypeScript project:

```bash
npm run build
```

## Production

Run the compiled application:

```bash
npm start
```

## Health Check

```http
GET /health
```

Example response:

```json
{
  "status": "ok",
  "service": "order-service"
}
```

## Authentication

Protected endpoints use the Auth Service JWT access token.

```http
Authorization: Bearer YOUR_ACCESS_TOKEN
```

The Order Service reads:

```text
userId
role
```

from the access token.

The Order Service does not manage user passwords or authentication credentials.

## Roles

Supported roles include:

```text
USER
RIDER
ADMIN
SUPER_ADMIN
```

Role permissions are applied at the route level.

Branch-specific ADMIN access is verified through Catalog Service branch memberships.

## Order Lifecycle

Orders follow this lifecycle:

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

Cancellation is allowed from:

```text
PENDING → CANCELLED
CONFIRMED → CANCELLED
```

Terminal states:

```text
DELIVERED
CANCELLED
```

Invalid status transitions are rejected.

## Order Creation

Create an order:

```http
POST /api/v1/orders
```

Authentication is required.

Example:

```json
{
  "branchId": "branch-id",
  "pickupSlot": {
    "date": "2026-09-29",
    "time": "11:00"
  },
  "deliverySlot": {
    "date": "2026-09-29",
    "time": "16:00"
  },
  "items": [
    {
      "serviceId": "service-id",
      "itemId": "item-id",
      "quantity": 1
    }
  ]
}
```

During order creation the service:

1. Validates the branch through Catalog Service.
2. Checks that the branch is active.
3. Validates service-item combinations.
4. Validates that service items are active.
5. Reads the current service-item price.
6. Calculates the subtotal.
7. Books pickup capacity.
8. Books delivery capacity.
9. Creates the order.
10. Creates the order items.

The price is stored as a snapshot in the order item.

## Order Items

Each order item stores:

```text
serviceId
itemId
quantity
unitPrice
totalPrice
```

This ensures historical orders retain the price that was used when the order was created.

## Pickup and Delivery Slots

Each order contains:

```text
pickupSlot
    date
    time

deliverySlot
    date
    time
```

Pickup and delivery capacity are managed separately.

## Capacity Management

Capacity belongs to the Order Service.

Each capacity slot contains:

```text
branchId
date
time
type
capacity
booked
```

Slot types:

```text
PICKUP
DELIVERY
```

Example:

```text
Branch: Feni

PICKUP
10:00 → capacity 100 → booked 72
11:00 → capacity 100 → booked 100

DELIVERY
16:00 → capacity 50 → booked 31
17:00 → capacity 50 → booked 50
```

## Creating Capacity Slots

Only an ADMIN with active membership for the requested branch can create a capacity slot.

```http
POST /api/v1/capacity-slots
```

Example:

```json
{
  "branchId": "branch-id",
  "date": "2026-09-29",
  "time": "11:00",
  "type": "PICKUP",
  "capacity": 10
}
```

## Available Capacity Slots

Available slots can be retrieved with:

```http
GET /api/v1/capacity-slots/available?branchId=branch-id&date=2026-09-29&type=PICKUP
```

Only slots where:

```text
booked < capacity
```

are returned.

## Atomic Capacity Booking

Capacity booking uses an atomic MongoDB update.

A slot is booked only when:

```text
booked < capacity
```

The booking operation increments:

```text
booked + 1
```

This prevents multiple simultaneous requests from exceeding the configured capacity.

## Capacity Rollback

When creating an order:

```text
Book pickup
     ↓
Book delivery
```

If delivery capacity cannot be booked:

```text
Release pickup
     ↓
Reject order
```

If order item creation fails after both slots were booked:

```text
Release pickup
     ↓
Release delivery
     ↓
Reject order
```

This prevents failed orders from permanently consuming capacity.

## Cancellation Capacity Release

When an order changes to:

```text
CANCELLED
```

the Order Service releases:

```text
Pickup capacity
Delivery capacity
```

Example:

```text
Before cancellation:

PICKUP   booked: 1
DELIVERY booked: 1

After cancellation:

PICKUP   booked: 0
DELIVERY booked: 0
```

## Order Endpoints

### Create Order

```http
POST /api/v1/orders
```

Authentication:

```text
Required
```

### Get Current User Orders

```http
GET /api/v1/orders?page=1&limit=10
```

Authentication:

```text
Required
```

### Get Order

```http
GET /api/v1/orders/:orderId
```

Authentication:

```text
Required
```

### Update Order Status

```http
PATCH /api/v1/orders/:orderId/status
```

Allowed roles:

```text
RIDER
ADMIN
SUPER_ADMIN
```

Example:

```json
{
  "status": "CONFIRMED"
}
```

### Assign Rider

```http
PATCH /api/v1/orders/:orderId/rider
```

Allowed roles:

```text
ADMIN
SUPER_ADMIN
```

Example:

```json
{
  "riderId": "rider-user-id"
}
```

A rider cannot be assigned twice to the same order.

## Rider Assignment

The Order Service stores:

```text
riderId
```

on the order.

The operational rider profile and rider availability belong to the Rider Service.

The future Rider Service will verify whether a rider is active and available before assignment.

## Pagination

User order listing supports:

```text
page
limit
```

Example:

```http
GET /api/v1/orders?page=1&limit=10
```

Response includes:

```text
orders
total
page
limit
totalPages
```

## MongoDB Collections

The Order Service uses:

```text
orders
orderitems
capacityslots
```

### Orders

Stores:

```text
userId
riderId
branchId
pickupSlot
deliverySlot
status
subtotal
discount
total
createdAt
updatedAt
```

### Order Items

Stores:

```text
orderId
serviceId
itemId
quantity
unitPrice
totalPrice
createdAt
updatedAt
```

### Capacity Slots

Stores:

```text
branchId
date
time
type
capacity
booked
createdAt
updatedAt
```

A unique compound index prevents duplicate capacity slots for the same:

```text
branch
date
time
type
```

## Catalog Service Integration

The Order Service communicates with Catalog Service for:

```text
Branch validation
Service validation
Item validation
Service-item validation
Price retrieval
Branch membership validation
```

Catalog Service remains the source of truth for catalog data.

## Docker

Build the image:

```bash
docker build -t ezzewash/order-service:1.0 .
```

Start the service:

```bash
docker compose up -d
```

Recreate the service after rebuilding:

```bash
docker compose down
docker compose up -d
```

## Docker Services

The Order Service Docker Compose setup contains:

```text
ezzewash-order-service
ezzewash-order-mongodb
ezzewash-order-redis
```

Ports:

```text
Order Service → 3003
MongoDB       → 27019
Redis         → 6381
```

Inside Docker, the Order Service connects to:

```text
MongoDB → order-mongodb:27017
Redis   → order-redis:6379
```

Catalog Service is accessed through:

```text
host.docker.internal:3002
```

## Service Ownership

```text
User account       → Auth Service
Password           → Auth Service
Role               → Auth Service

Branch             → Catalog Service
Service            → Catalog Service
Item               → Catalog Service
Pricing            → Catalog Service
Offers             → Catalog Service

Order              → Order Service
Order item         → Order Service
Booking capacity   → Order Service
Pickup slot        → Order Service
Delivery slot      → Order Service
Rider assignment   → Order Service

Rider profile      → Rider Service
Rider availability → Rider Service
Rider GPS          → Rider Service + Redis

Payment            → Payment Service
Notifications      → Notification Service
```

## Current Status

```text
Authentication       ✓
Order creation       ✓
Order items          ✓
Catalog validation   ✓
Price snapshot       ✓
Order lifecycle      ✓
Order cancellation   ✓
Pagination           ✓
Rider assignment     ✓
Capacity slots       ✓
Slot availability    ✓
Atomic booking       ✓
Overbooking control  ✓
Booking rollback     ✓
Cancellation release ✓
Docker                ✓
```

The Order Service is currently complete for its defined responsibilities.

The next services are:

```text
Rider Service
Payment Service
Notification Service
API Gateway
```
