# Ezzewash Catalog Service

Catalog Service is a backend microservice for managing the Ezzewash catalog domain.

It manages branches, services, items, service-item relationships, offers, reviews, and branch memberships.

The service is built with Node.js, TypeScript, Express, MongoDB, Mongoose, and Redis, and is designed to run independently as part of the Ezzewash microservice architecture.

## Features

* Branch management
* Service management
* Item management
* Service-item relationships
* Offer management
* Offer assignment to specific users
* Customer reviews
* Branch membership management
* JWT authentication
* Role-based authorization
* Branch-level authorization
* Request ID tracking
* Centralized error handling
* Standardized API responses
* Request validation with Zod
* Pagination
* Rate limiting
* CORS configuration
* Helmet security headers
* MongoDB with Mongoose
* Redis caching
* Health check endpoint
* Readiness endpoint
* Swagger API documentation
* Graceful shutdown
* Docker support
* Docker Compose support

## Technology Stack

* Node.js 22
* TypeScript
* Express
* MongoDB
* Mongoose
* Redis
* Zod
* JWT
* Swagger / OpenAPI
* Docker
* Docker Compose
* npm

## Service Port

The Catalog Service runs on:

```text
3002
```

Local API:

```text
http://localhost:3002
```

API base path:

```text
http://localhost:3002/api/v1
```

Swagger documentation:

```text
http://localhost:3002/api-docs
```

## Project Structure

```text
catalog-service/
│
├── src/
│   │
│   ├── infrastructure/
│   │   ├── config/
│   │   ├── database/
│   │   ├── http/
│   │   └── redis/
│   │
│   ├── modules/
│   │   ├── branches/
│   │   ├── services/
│   │   ├── items/
│   │   ├── service-items/
│   │   ├── offers/
│   │   ├── reviews/
│   │   └── branch-memberships/
│   │
│   ├── app.ts
│   └── server.ts
│
├── Dockerfile
├── docker-compose.yml
├── .dockerignore
├── .env
├── package.json
├── tsconfig.json
└── README.md
```

## Architecture

The Catalog Service follows a layered modular architecture.

```text
HTTP Request
     │
     ▼
Routes
     │
     ▼
Middleware
     │
     ▼
Controller
     │
     ▼
Service
     │
     ▼
Repository
     │
     ▼
MongoDB
```

Redis is used as an infrastructure dependency for caching.

```text
Offer Service
     │
     ├── Redis Cache
     │
     └── MongoDB
```

## Modules

### Branches

Responsible for catalog branches.

```text
/api/v1/branches
```

Supports branch creation, retrieval, updates, status management, deletion, and pagination.

### Services

Responsible for the services offered by branches.

```text
/api/v1/services
```

Services belong to a specific branch.

### Items

Responsible for catalog items.

```text
/api/v1/items
```

### Service Items

Connects catalog services with the items required by those services.

```text
/api/v1/service-items
```

### Offers

Responsible for promotional offers and discounts.

```text
/api/v1/offers
```

Offers support:

* Percentage discounts
* Fixed discounts
* Start and end dates
* Minimum order amounts
* Maximum discount amounts
* Service-specific offers
* All-user offers
* Specific-user offers
* Offer assignments
* Active/inactive status

### Reviews

Responsible for customer reviews and ratings.

```text
/api/v1/reviews
```

### Branch Memberships

Controls which users can manage which branches.

```text
/api/v1/branch-memberships
```

## Authentication

Catalog Service uses JWT authentication.

Protected endpoints require:

```text
Authorization: Bearer <ACCESS_TOKEN>
```

Authentication is handled through JWT middleware.

The JWT contains the authenticated user's identity and role.

## Authorization

The service uses role-based and branch-level authorization.

Supported roles include:

```text
SUPER_ADMIN
ADMIN
RIDER
USER
```

### SUPER_ADMIN

Can manage catalog resources across branches.

### ADMIN

Can manage catalog resources for branches where the user has an active branch membership.

### RIDER

Cannot perform administrative catalog mutations.

### USER

Can access permitted customer-facing functionality but cannot perform administrative catalog mutations.

Branch authorization is handled centrally through the Branch Access Service.

## Validation

Request validation is handled using Zod.

Validation includes:

* Required fields
* String length
* Numeric ranges
* Enum values
* Object ID format
* Date validation
* Offer discount rules
* Pagination parameters

Invalid requests return a standardized error response.

## API Response Format

Successful responses use the standard response structure:

```json
{
  "success": true,
  "data": {},
  "requestId": "..."
}
```

Responses may also include a message:

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {},
  "requestId": "..."
}
```

Error responses use:

```json
{
  "success": false,
  "message": "Error message",
  "requestId": "..."
}
```

## Request IDs

Every request receives a request ID.

The request ID is included in API responses:

```json
{
  "success": true,
  "requestId": "..."
}
```

This allows requests to be correlated across logs and services.

## Pagination

Paginated endpoints support:

```text
?page=1&limit=20
```

Default:

```text
page = 1
limit = 20
```

Maximum limit:

```text
100
```

Pagination responses include metadata such as:

```json
{
  "page": 1,
  "limit": 20,
  "total": 100,
  "totalPages": 5
}
```

## Redis

Redis is currently used by the Offer module for active-offer caching.

Cache key format:

```text
catalog:offers:active:{branchId}
```

Active offers are cached for:

```text
60 seconds
```

The cache is invalidated when an offer is:

* Created
* Updated
* Activated
* Deactivated
* Deleted

The Redis abstraction is located under:

```text
src/infrastructure/redis/
```

## Health Checks

### Health

```http
GET /health
```

Checks whether the Catalog Service process is running.

### Readiness

```http
GET /ready
```

Checks the availability of required dependencies.

Example:

```json
{
  "success": true,
  "data": {
    "status": "ready",
    "service": "catalog-service",
    "dependencies": {
      "mongodb": "up",
      "redis": "up"
    }
  }
}
```

If MongoDB or Redis is unavailable, the service reports:

```text
503 Service Unavailable
```

## Environment Variables

Create a `.env` file in the Catalog Service root.

Example:

```env
NODE_ENV=development
PORT=3002

MONGO_URI=mongodb://localhost:27017/ezzewash_catalog

REDIS_URL=redis://localhost:6379

JWT_ACCESS_SECRET=your-jwt-access-secret

ALLOWED_ORIGINS=http://localhost:3000
```

For Docker, Compose overrides the MongoDB and Redis URLs:

```text
MONGO_URI=mongodb://catalog-mongodb:27017/ezzewash_catalog
REDIS_URL=redis://catalog-redis:6379
```

Docker service names must be used for container-to-container communication instead of `localhost`.

## Local Development

Install dependencies:

```bash
npm install
```

Build the TypeScript project:

```bash
npm run build
```

Start the service according to the available npm scripts in `package.json`.

Local infrastructure can run on:

```text
MongoDB → localhost:27017
Redis   → localhost:6379
```

## Docker

The Catalog Service uses a multi-stage Docker build.

### Build Image

```bash
docker build -t ezzewash/catalog-service:1.0 .
```

### Build Without Cache

Use this when you want to ensure the image is built completely from the current source:

```bash
docker build --no-cache -t ezzewash/catalog-service:1.0 .
```

### Start Catalog Stack

```bash
docker compose up -d
```

### Stop Catalog Stack

```bash
docker compose down
```

## Docker Architecture

Catalog runs as a separate Docker Compose project.

```text
                    ┌─────────────────────────┐
                    │    Catalog Service      │
                    │        :3002            │
                    └────────────┬────────────┘
                                 │
                    ┌────────────┴────────────┐
                    │                         │
                    ▼                         ▼
          ┌──────────────────┐     ┌──────────────────┐
          │     MongoDB      │     │      Redis       │
          │      :27017      │     │      :6379       │
          └──────────────────┘     └──────────────────┘
```

Host ports:

```text
Catalog API → 3002
MongoDB     → 27018
Redis       → 6380
```

Container ports:

```text
Catalog API → 3002
MongoDB     → 27017
Redis       → 6379
```

Docker service names:

```text
catalog-mongodb
catalog-redis
```

## Docker Volumes

Catalog uses persistent Docker volumes for MongoDB and Redis:

```text
catalog_mongodb_data
catalog_redis_data
```

These volumes preserve data when containers are recreated.

## API Documentation

Swagger UI is available at:

```text
http://localhost:3002/api-docs
```

Use Swagger for exploring the available endpoints and request schemas.

## Security

The service includes:

* Helmet
* CORS
* JWT authentication
* Role-based authorization
* Branch-level authorization
* Request validation
* Rate limiting
* Centralized error handling
* Restricted request body size
* Environment-based configuration

## Error Handling

Errors are handled centrally through the application error middleware.

The service avoids returning internal implementation details to clients.

Typical HTTP status codes include:

```text
200 OK
201 Created
400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
409 Conflict
429 Too Many Requests
500 Internal Server Error
503 Service Unavailable
```

## Graceful Shutdown

The service handles shutdown signals such as:

```text
SIGINT
SIGTERM
```

During shutdown it:

1. Stops accepting new requests.
2. Closes the HTTP server.
3. Closes the MongoDB connection.
4. Closes the Redis connection.
5. Exits the process.

## Testing With Postman

Recommended base URL:

```text
http://localhost:3002/api/v1
```

Important resources to test:

```text
Branches
Services
Items
Service Items
Offers
Reviews
Branch Memberships
```

Authentication should be tested with valid and invalid JWT tokens.

Authorization should be tested with different roles and branch memberships.

## Development Workflow

Before rebuilding the Docker image after code changes:

```bash
npm run build
```

Then rebuild the image:

```bash
docker build --no-cache -t ezzewash/catalog-service:1.0 .
```

Restart the Compose stack:

```bash
docker compose down
docker compose up -d
```

This ensures the running container uses the latest application source.

## Current Microservice Architecture

Catalog is one service in the larger Ezzewash backend architecture.

```text
Ezzewash
│
├── Auth Service
│   ├── Authentication
│   ├── JWT
│   ├── MongoDB
│   └── Redis
│
├── Catalog Service
│   ├── Branches
│   ├── Services
│   ├── Items
│   ├── Service Items
│   ├── Offers
│   ├── Reviews
│   ├── Branch Memberships
│   ├── MongoDB
│   └── Redis
│
├── Order Service
│
├── Rider Service
│
└── API Gateway
```

Each service is independently deployable and maintains its own application boundaries.

## Status

Catalog Service currently provides the core catalog functionality required by the Ezzewash platform and is Dockerized with its own MongoDB and Redis infrastructure.

Further integration with Order Service, Rider Service, and API Gateway will be handled independently.
