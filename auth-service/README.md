# Auth Service — EzzeWash

The **Auth Service** is a microservice responsible for authentication, authorization, user account management, session management, and profile management within the EzzeWash application ecosystem.

## Architecture

The service follows a modular architecture designed for maintainability and scalability.

* **Node.js & Express.js** — REST API framework.
* **TypeScript** — Static typing and compile-time safety.
* **MongoDB** — Primary database using Mongoose ODM.
* **Redis** — Used for OTP storage, refresh-token/session state, revoked-token detection, and rate limiting.
* **Zod** — Request validation and schema enforcement.
* **Docker** — Containerization and consistent deployment.
* **Swagger/OpenAPI** — Interactive API documentation.

## Key Features

### Authentication

* User registration
* Login and logout
* JWT access tokens
* JWT refresh tokens
* Refresh-token rotation
* Refresh-token reuse detection
* OTP-based email verification
* Forgot-password flow
* Password reset through OTP
* Authenticated password change

### Session Management

* View active sessions
* Revoke a specific session
* Revoke all sessions
* Refresh-token session tracking
* Automatic session invalidation after refresh-token reuse detection

### User Profile Management

* View own profile
* Update own profile
* Change password
* Upload profile picture
* Delete own account
* Profile-picture serving through `/uploads`

### Address Management

* Add address
* View addresses
* Update address
* Delete address
* Set default address

### Role Management

The service supports four roles:

```text
SUPER_ADMIN
    ↓
ADMIN
    ↓
RIDER
    ↓
USER
```

Role permissions:

* **SUPER_ADMIN**

  * Manage users, riders, and admins.
  * Create ADMIN accounts.
  * Create RIDER accounts.
  * Activate/deactivate users, riders, and admins.
  * Cannot deactivate or delete itself.

* **ADMIN**

  * Manage USER and RIDER accounts.
  * Create RIDER accounts.
  * Cannot create or manage ADMIN accounts.
  * Cannot manage SUPER_ADMIN.

* **RIDER**

  * Can perform normal authenticated account operations.
  * Cannot access administrative operations.

* **USER**

  * Can perform normal authenticated account operations.
  * Cannot access administrative operations.

Public registration always creates a `USER`.

### Security and Reliability

* JWT authentication
* Role-based authorization
* Refresh-token rotation
* Refresh-token reuse detection
* Rate limiting
* Helmet security headers
* CORS configuration
* Request ID tracking
* Zod request validation
* MongoDB readiness checking
* Redis readiness checking
* Swagger/OpenAPI documentation

---

# API Endpoints

User APIs are prefixed with:

```text
/api/v1/users
```

System endpoints such as health checks and Swagger are outside this prefix.

## Authentication & Registration

### Register

```http
POST /api/v1/users/register
```

Register a new USER account.

### Login

```http
POST /api/v1/users/login
```

Authenticate a user and receive access and refresh tokens.

### Logout

```http
POST /api/v1/users/logout
```

Requires authentication.

### Refresh Tokens

```http
POST /api/v1/users/refresh
```

Refresh an access token using a valid refresh token.

Refresh-token rotation is applied during this process.

---

## Email Verification

### Verify Email

```http
POST /api/v1/users/verify-email
```

Verify the user's email using an OTP.

### Resend Verification OTP

```http
POST /api/v1/users/resend-verification
```

Send a new email-verification OTP.

---

## Password Management

### Forgot Password

```http
POST /api/v1/users/forgot-password
```

Request a password-reset OTP.

### Verify Reset OTP

```http
POST /api/v1/users/verify-reset-otp
```

Verify the password-reset OTP and receive the reset token when applicable.

### Reset Password

```http
POST /api/v1/users/reset-password
```

Set a new password using the valid reset token.

### Change Password

```http
PATCH /api/v1/users/me/password
```

Requires authentication.

---

## Profile Management

All endpoints in this section require authentication.

### Get Profile

```http
GET /api/v1/users/me
```

Get the currently authenticated user's profile.

### Update Profile

```http
PATCH /api/v1/users/me
```

Update the authenticated user's profile information.

### Upload Profile Picture

```http
POST /api/v1/users/me/profile-picture
```

Upload or replace a profile picture using `multipart/form-data`.

Uploaded files are served through:

```text
/uploads/<path>
```

For example:

```text
http://localhost:3001/uploads/profile-pictures/example.png
```

### Delete Account

```http
DELETE /api/v1/users/me
```

Delete the authenticated user's account.

The `SUPER_ADMIN` account is protected from self-deletion.

---

## Address Management

All endpoints in this section require authentication.

### Add Address

```http
POST /api/v1/users/me/addresses
```

### Get Addresses

```http
GET /api/v1/users/me/addresses
```

### Update Address

```http
PATCH /api/v1/users/me/addresses/:addressId
```

### Delete Address

```http
DELETE /api/v1/users/me/addresses/:addressId
```

### Set Default Address

```http
PATCH /api/v1/users/me/addresses/:addressId/default
```

---

## Session Management

All endpoints in this section require authentication.

### Get Active Sessions

```http
GET /api/v1/users/sessions
```

### Revoke One Session

```http
DELETE /api/v1/users/sessions/:sessionId
```

### Revoke All Sessions

```http
DELETE /api/v1/users/sessions
```

---

## Admin Operations

Administrative endpoints require authentication and specific roles.

### Admin Test

```http
GET /api/v1/users/admin-test
```

Available to:

```text
ADMIN
SUPER_ADMIN
```

### Update User Status

```http
PATCH /api/v1/users/:id/status
```

Available to:

```text
ADMIN
SUPER_ADMIN
```

ADMIN can manage USER and RIDER accounts.

SUPER_ADMIN can manage USER, RIDER, and ADMIN accounts.

SUPER_ADMIN cannot deactivate itself.

### Create ADMIN

```http
POST /api/v1/users/admin/admins
```

Available to:

```text
SUPER_ADMIN
```

### Create RIDER

```http
POST /api/v1/users/admin/riders
```

Available to:

```text
ADMIN
SUPER_ADMIN
```

---

## System Health

### Health

```http
GET /health
```

Returns basic service status and uptime.

### Readiness

```http
GET /ready
```

Checks the availability of:

* MongoDB
* Redis

Returns `200` when dependencies are ready and `503` otherwise.

---

# Environment Variables

Create a `.env` file in the root of the service.

Example:

```env
# Application
PORT=3001

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

# Database
# Docker:
MONGODB_URI=mongodb://mongodb:27017/ezzewash

# Local development:
# MONGODB_URI=mongodb://localhost:27017/ezzewash

# Redis
# Docker:
REDIS_URL=redis://redis:6379

# Local development:
# REDIS_URL=redis://localhost:6379

# JWT
JWT_ACCESS_SECRET=your_access_token_secret
JWT_REFRESH_SECRET=your_refresh_token_secret

# Mail
MAIL_HOST=smtp.example.com
MAIL_PORT=587
MAIL_USER=your_mail_username
MAIL_PASSWORD=your_mail_password
MAIL_FROM=noreply@ezzewash.com
```

Use the exact environment variable names expected by `src/infrastructure/config/config.ts`.

Never commit real secrets to Git.

---

# Docker

The current auth-service Docker image is:

```text
ezzewash/auth-service:1.3
```

## Build the image

```bash
docker build -t ezzewash/auth-service:1.3 .
```

## Start the complete auth stack

Make sure `.env` is configured first.

```bash
docker compose up -d
```

This starts:

```text
ezzewash-auth-service
ezzewash-mongodb
ezzewash-redis
```

The auth-service is exposed on:

```text
http://localhost:3001
```

## Check containers

```bash
docker compose ps
```

## View auth-service logs

```bash
docker compose logs auth-service
```

Follow logs continuously:

```bash
docker compose logs -f auth-service
```

## Recreate auth-service after an image update

After changing application code:

```bash
docker build -t ezzewash/auth-service:1.4 .
```

Update the image tag in `docker-compose.yml` and run:

```bash
docker compose up -d --force-recreate auth-service
```

## Stop containers

```bash
docker compose down
```

This stops the containers but preserves named volumes.

**Do not use this unless you intentionally want to delete database data:**

```bash
docker compose down -v
```

The `-v` option removes the Docker volumes containing persistent MongoDB/Redis data.

---

# Docker Networking

From the host machine:

```text
http://localhost:3001
```

Inside the Docker network, services communicate using their Compose service names.

For example:

```text
auth-service → mongodb:27017
auth-service → redis:6379
```

Do not use `localhost` to reach MongoDB or Redis from inside the auth-service container.

---

# Local Development Without Docker

## Install dependencies

```bash
npm install
```

## Run MongoDB and Redis

Start local MongoDB and Redis.

Then change the environment configuration to use:

```env
MONGODB_URI=mongodb://localhost:27017/ezzewash
REDIS_URL=redis://localhost:6379
```

## Start development server

```bash
npm run dev
```

The development server runs with hot reload.

---

# Available Scripts

```bash
npm run dev
```

Starts the development server with hot reload.

```bash
npm run build
```

Compiles TypeScript into `dist`.

```bash
npm run start
```

Runs the compiled application.

---

# Swagger / OpenAPI

Interactive API documentation is available at:

```text
http://localhost:3001/api-docs
```

Swagger provides:

* API endpoint documentation
* Request schemas
* Response documentation
* Authentication documentation
* JWT Bearer authorization
* Interactive "Try it out" requests

For authenticated APIs, use:

```text
Authorize
```

and enter:

```text
Bearer YOUR_ACCESS_TOKEN
```

---

# Persistence

Docker uses named volumes for persistent data:

```text
mongodb_data
redis_data
uploads
```

These volumes preserve:

* MongoDB user/account data
* Redis data
* Uploaded profile pictures

Removing the application container or updating the auth-service image does not remove these volumes.

Only explicitly removing the volumes, such as with:

```bash
docker compose down -v
```

or manually deleting them will remove the stored data.

---

# Current Service Status

The auth-service is currently designed to run as:

```text
                    ┌───────────────┐
                    │ Auth Service  │
                    │ Node/Express  │
                    └───────┬───────┘
                            │
              ┌─────────────┴─────────────┐
              │                           │
        ┌─────▼─────┐               ┌─────▼─────┐
        │  MongoDB  │               │   Redis   │
        └───────────┘               └───────────┘
```

Later, this service will communicate with the other EzzeWash microservices through the Docker network and, where appropriate, asynchronous messaging infrastructure such as Kafka.
