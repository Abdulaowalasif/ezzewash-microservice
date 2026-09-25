import swaggerJSDoc from "swagger-jsdoc";

const options: swaggerJSDoc.Options = {
    definition: {
        openapi: "3.0.0",

        info: {
            title: "Ezzewash Auth Service API",
            version: "1.0.0",
            description:
                "Authentication, user management, address, profile, and session management APIs for Ezzewash.",
        },

        servers: [
            {
                url: "http://localhost:3001",
                description: "Local development server",
            },
        ],

        tags: [
            {
                name: "Health",
                description: "Service health and readiness",
            },
            {
                name: "Authentication",
                description: "Registration, login, email verification and password recovery",
            },
            {
                name: "Users",
                description: "User profile and account management",
            },
            {
                name: "Addresses",
                description: "User address management",
            },
            {
                name: "Sessions",
                description: "Refresh-token session management",
            },
            {
                name: "Admin",
                description: "Administrator-only operations",
            },
        ],

        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                    description:
                        "Enter the access token returned by the login or refresh endpoint.",
                },
            },

            schemas: {
                Error: {
                    type: "object",
                    properties: {
                        message: {
                            type: "string",
                            example: "Invalid or expired access token",
                        },
                    },
                },

                RegisterRequest: {
                    type: "object",
                    required: [
                        "firstName",
                        "lastName",
                        "email",
                        "phone",
                        "password",
                    ],
                    properties: {
                        firstName: {
                            type: "string",
                            minLength: 2,
                            example: "Abdul",
                        },
                        lastName: {
                            type: "string",
                            minLength: 2,
                            example: "Asif",
                        },
                        email: {
                            type: "string",
                            format: "email",
                            example: "user@example.com",
                        },
                        phone: {
                            type: "string",
                            minLength: 10,
                            example: "01712345678",
                        },
                        password: {
                            type: "string",
                            format: "password",
                            minLength: 8,
                            maxLength: 72,
                            example: "StrongPassword123",
                        },
                    },
                },

                LoginRequest: {
                    type: "object",
                    required: ["email", "password"],
                    properties: {
                        email: {
                            type: "string",
                            format: "email",
                            example: "user@example.com",
                        },
                        password: {
                            type: "string",
                            format: "password",
                            example: "StrongPassword123",
                        },
                    },
                },

                RefreshRequest: {
                    type: "object",
                    required: ["refreshToken"],
                    properties: {
                        refreshToken: {
                            type: "string",
                            example: "eyJhbGciOiJIUzI1NiIs...",
                        },
                    },
                },

                VerifyEmailRequest: {
                    type: "object",
                    required: ["email", "otp"],
                    properties: {
                        email: {
                            type: "string",
                            format: "email",
                            example: "user@example.com",
                        },
                        otp: {
                            type: "string",
                            example: "123456",
                        },
                    },
                },

                ResendVerificationRequest: {
                    type: "object",
                    required: ["email"],
                    properties: {
                        email: {
                            type: "string",
                            format: "email",
                            example: "user@example.com",
                        },
                    },
                },

                ForgotPasswordRequest: {
                    type: "object",
                    required: ["email"],
                    properties: {
                        email: {
                            type: "string",
                            format: "email",
                            example: "user@example.com",
                        },
                    },
                },

                VerifyResetOtpRequest: {
                    type: "object",
                    required: ["email", "otp"],
                    properties: {
                        email: {
                            type: "string",
                            format: "email",
                            example: "user@example.com",
                        },
                        otp: {
                            type: "string",
                            example: "123456",
                        },
                    },
                },

                ResetPasswordRequest: {
                    type: "object",
                    required: [
                        "email",
                        "otp",
                        "newPassword",
                    ],
                    properties: {
                        email: {
                            type: "string",
                            format: "email",
                            example: "user@example.com",
                        },
                        otp: {
                            type: "string",
                            example: "123456",
                        },
                        newPassword: {
                            type: "string",
                            format: "password",
                            minLength: 8,
                            maxLength: 72,
                            example: "NewStrongPassword123",
                        },
                    },
                },

                ChangePasswordRequest: {
                    type: "object",
                    required: [
                        "currentPassword",
                        "newPassword",
                    ],
                    properties: {
                        currentPassword: {
                            type: "string",
                            format: "password",
                            example: "OldPassword123",
                        },
                        newPassword: {
                            type: "string",
                            format: "password",
                            minLength: 8,
                            maxLength: 72,
                            example: "NewPassword123",
                        },
                    },
                },

                UpdateProfileRequest: {
                    type: "object",
                    properties: {
                        firstName: {
                            type: "string",
                            example: "Abdul",
                        },
                        lastName: {
                            type: "string",
                            example: "Asif",
                        },
                        phone: {
                            type: "string",
                            example: "01712345678",
                        },
                        profilePicture: {
                            type: "string",
                            format: "uri",
                            nullable: true,
                            example:
                                "http://localhost:3001/uploads/profile-pictures/example.jpg",
                        },
                        dateOfBirth: {
                            type: "string",
                            format: "date",
                            nullable: true,
                            example: "2000-01-01",
                        },
                    },
                },

                Address: {
                    type: "object",
                    properties: {
                        label: {
                            type: "string",
                            enum: ["HOME", "WORK", "OTHER"],
                            example: "HOME",
                        },
                        addressLine1: {
                            type: "string",
                            example: "House 12, Road 5",
                        },
                        addressLine2: {
                            type: "string",
                            nullable: true,
                            example: "Near Main Road",
                        },
                        city: {
                            type: "string",
                            example: "Dhaka",
                        },
                        state: {
                            type: "string",
                            nullable: true,
                            example: "Dhaka",
                        },
                        postalCode: {
                            type: "string",
                            nullable: true,
                            example: "1207",
                        },
                        country: {
                            type: "string",
                            example: "Bangladesh",
                        },
                        location: {
                            type: "object",
                            nullable: true,
                            properties: {
                                latitude: {
                                    type: "number",
                                    example: 23.8103,
                                },
                                longitude: {
                                    type: "number",
                                    example: 90.4125,
                                },
                            },
                        },
                        isDefault: {
                            type: "boolean",
                            example: true,
                        },
                    },
                },

                CreateAddressRequest: {
                    allOf: [
                        {
                            $ref: "#/components/schemas/Address",
                        },
                    ],
                },

                UpdateAddressRequest: {
                    allOf: [
                        {
                            $ref: "#/components/schemas/Address",
                        },
                    ],
                    description:
                        "All fields are optional. At least one field must be supplied.",
                },

                UpdateUserStatusRequest: {
                    type: "object",
                    required: ["isActive"],
                    properties: {
                        isActive: {
                            type: "boolean",
                            example: false,
                        },
                    },
                },

                Session: {
                    type: "object",
                    properties: {
                        sessionId: {
                            type: "string",
                            format: "uuid",
                            example:
                                "9993072f-9a9b-435e-a43c-84cb65dc2cf8",
                        },
                        createdAt: {
                            type: "string",
                            format: "date-time",
                            example:
                                "2026-09-25T09:04:24.752Z",
                        },
                    },
                },

                TokenResponse: {
                    type: "object",
                    properties: {
                        accessToken: {
                            type: "string",
                        },
                        refreshToken: {
                            type: "string",
                        },
                    },
                },
            },
        },

        paths: {
            "/health": {
                get: {
                    tags: ["Health"],
                    summary: "Check service health",
                    responses: {
                        200: {
                            description: "Service is healthy",
                        },
                        503: {
                            description:
                                "Service or dependency is unhealthy",
                        },
                    },
                },
            },


            "/ready": {
                get: {
                    tags: ["Health"],
                    summary: "Check service readiness",
                    responses: {
                        200: {
                            description: "Service is ready",
                        },
                        503: {
                            description:
                                "Service is not ready",
                        },
                    },
                },
            },

            "/api/v1/users/register": {
                post: {
                    tags: ["Authentication"],
                    summary: "Register a new user",
                    requestBody: {
                        required: true,
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/RegisterRequest",
                                },
                            },
                        },
                    },
                    responses: {
                        201: {
                            description:
                                "User registered successfully",
                        },
                        400: {
                            description:
                                "Validation failed",
                        },
                        409: {
                            description:
                                "Email or phone already exists",
                        },
                        429: {
                            description:
                                "Too many registration requests",
                        },
                    },
                },
            },

            "/api/v1/users/login": {
                post: {
                    tags: ["Authentication"],
                    summary: "Login",
                    requestBody: {
                        required: true,
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/LoginRequest",
                                },
                            },
                        },
                    },
                    responses: {
                        200: {
                            description:
                                "Login successful",
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        properties: {
                                            accessToken: {
                                                type: "string",
                                            },
                                            refreshToken: {
                                                type: "string",
                                            },
                                        },
                                    },
                                },
                            },
                        },
                        400: {
                            description:
                                "Validation failed",
                        },
                        401: {
                            description:
                                "Invalid credentials or email not verified",
                        },
                        403: {
                            description:
                                "Account is inactive",
                        },
                        429: {
                            description:
                                "Too many login attempts",
                        },
                    },
                },
            },

            "/api/v1/users/refresh": {
                post: {
                    tags: ["Authentication"],
                    summary:
                        "Refresh access and refresh tokens",
                    requestBody: {
                        required: true,
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/RefreshRequest",
                                },
                            },
                        },
                    },
                    responses: {
                        200: {
                            description:
                                "Tokens refreshed successfully",
                        },
                        400: {
                            description:
                                "Validation failed",
                        },
                        401: {
                            description:
                                "Invalid, expired, or reused refresh token",
                        },
                        403: {
                            description:
                                "Account is inactive",
                        },
                        429: {
                            description:
                                "Too many refresh attempts",
                        },
                    },
                },
            },

            "/api/v1/users/logout": {
                post: {
                    tags: ["Authentication"],
                    summary: "Logout current session",
                    security: [
                        {
                            bearerAuth: [],
                        },
                    ],
                    requestBody: {
                        required: true,
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    required: ["refreshToken"],
                                    properties: {
                                        refreshToken: {
                                            type: "string",
                                        },
                                    },
                                },
                            },
                        },
                    },
                    responses: {
                        200: {
                            description:
                                "Logged out successfully",
                        },
                        401: {
                            description:
                                "Authentication required",
                        },
                    },
                },
            },

            "/api/v1/users/verify-email": {
                post: {
                    tags: ["Authentication"],
                    summary: "Verify email address",
                    requestBody: {
                        required: true,
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/VerifyEmailRequest",
                                },
                            },
                        },
                    },
                    responses: {
                        200: {
                            description:
                                "Email verified successfully",
                        },
                        400: {
                            description:
                                "Invalid or expired OTP",
                        },
                        404: {
                            description:
                                "User not found",
                        },
                        429: {
                            description:
                                "Too many OTP verification attempts",
                        },
                    },
                },
            },

            "/api/v1/users/resend-verification": {
                post: {
                    tags: ["Authentication"],
                    summary: "Resend email verification OTP",
                    requestBody: {
                        required: true,
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/ResendVerificationRequest",
                                },
                            },
                        },
                    },
                    responses: {
                        200: {
                            description:
                                "Verification OTP sent",
                        },
                        400: {
                            description:
                                "Invalid request",
                        },
                        429: {
                            description:
                                "Too many requests",
                        },
                    },
                },
            },

            "/api/v1/users/forgot-password": {
                post: {
                    tags: ["Authentication"],
                    summary: "Request password reset OTP",
                    requestBody: {
                        required: true,
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/ForgotPasswordRequest",
                                },
                            },
                        },
                    },
                    responses: {
                        200: {
                            description:
                                "Password reset request processed",
                        },
                        400: {
                            description:
                                "Invalid request",
                        },
                        429: {
                            description:
                                "Too many requests",
                        },
                    },
                },
            },

            "/api/v1/users/verify-reset-otp": {
                post: {
                    tags: ["Authentication"],
                    summary: "Verify password reset OTP",
                    requestBody: {
                        required: true,
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/VerifyResetOtpRequest",
                                },
                            },
                        },
                    },
                    responses: {
                        200: {
                            description:
                                "Reset OTP verified",
                        },
                        400: {
                            description:
                                "Invalid or expired OTP",
                        },
                        429: {
                            description:
                                "Too many verification attempts",
                        },
                    },
                },
            },

            "/api/v1/users/reset-password": {
                post: {
                    tags: ["Authentication"],
                    summary: "Reset password",
                    requestBody: {
                        required: true,
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/ResetPasswordRequest",
                                },
                            },
                        },
                    },
                    responses: {
                        200: {
                            description:
                                "Password reset successfully",
                        },
                        400: {
                            description:
                                "Invalid request or OTP",
                        },
                        429: {
                            description:
                                "Too many requests",
                        },
                    },
                },
            },

            "/api/v1/users/me": {
                get: {
                    tags: ["Users"],
                    summary: "Get current user profile",
                    security: [
                        {
                            bearerAuth: [],
                        },
                    ],
                    responses: {
                        200: {
                            description:
                                "Current user profile",
                        },
                        401: {
                            description:
                                "Authentication required",
                        },
                    },
                },

                patch: {
                    tags: ["Users"],
                    summary: "Update current user profile",
                    security: [
                        {
                            bearerAuth: [],
                        },
                    ],
                    requestBody: {
                        required: true,
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/UpdateProfileRequest",
                                },
                            },
                        },
                    },
                    responses: {
                        200: {
                            description:
                                "Profile updated successfully",
                        },
                        400: {
                            description:
                                "Validation failed",
                        },
                        401: {
                            description:
                                "Authentication required",
                        },
                        404: {
                            description:
                                "User not found",
                        },
                    },
                },

                delete: {
                    tags: ["Users"],
                    summary: "Delete current user account",
                    security: [
                        {
                            bearerAuth: [],
                        },
                    ],
                    responses: {
                        200: {
                            description:
                                "Account deleted successfully",
                        },
                        401: {
                            description:
                                "Authentication required",
                        },
                        404: {
                            description:
                                "User not found",
                        },
                    },
                },
            },

            "/api/v1/users/me/password": {
                patch: {
                    tags: ["Users"],
                    summary: "Change current password",
                    security: [
                        {
                            bearerAuth: [],
                        },
                    ],
                    requestBody: {
                        required: true,
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/ChangePasswordRequest",
                                },
                            },
                        },
                    },
                    responses: {
                        200: {
                            description:
                                "Password changed successfully",
                        },
                        400: {
                            description:
                                "Invalid current password or validation failure",
                        },
                        401: {
                            description:
                                "Authentication required",
                        },
                    },
                },
            },

            "/api/v1/users/me/profile-picture": {
                post: {
                    tags: ["Users"],
                    summary: "Upload profile picture",
                    security: [
                        {
                            bearerAuth: [],
                        },
                    ],
                    requestBody: {
                        required: true,
                        content: {
                            "multipart/form-data": {
                                schema: {
                                    type: "object",
                                    required: ["profilePicture"],
                                    properties: {
                                        profilePicture: {
                                            type: "string",
                                            format: "binary",
                                        },
                                    },
                                },
                            },
                        },
                    },
                    responses: {
                        200: {
                            description:
                                "Profile picture uploaded successfully",
                        },
                        400: {
                            description:
                                "Invalid image or missing file",
                        },
                        401: {
                            description:
                                "Authentication required",
                        },
                    },
                },
            },

            "/api/v1/users/me/addresses": {
                get: {
                    tags: ["Addresses"],
                    summary: "Get current user's addresses",
                    security: [
                        {
                            bearerAuth: [],
                        },
                    ],
                    responses: {
                        200: {
                            description:
                                "Addresses returned successfully",
                        },
                        401: {
                            description:
                                "Authentication required",
                        },
                    },
                },

                post: {
                    tags: ["Addresses"],
                    summary: "Create an address",
                    security: [
                        {
                            bearerAuth: [],
                        },
                    ],
                    requestBody: {
                        required: true,
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/CreateAddressRequest",
                                },
                            },
                        },
                    },
                    responses: {
                        201: {
                            description:
                                "Address created successfully",
                        },
                        400: {
                            description:
                                "Validation failed",
                        },
                        401: {
                            description:
                                "Authentication required",
                        },
                    },
                },
            },

            "/api/v1/users/me/addresses/{addressId}/default": {
                patch: {
                    tags: ["Addresses"],
                    summary: "Set address as default",
                    security: [
                        {
                            bearerAuth: [],
                        },
                    ],
                    parameters: [
                        {
                            name: "addressId",
                            in: "path",
                            required: true,
                            schema: {
                                type: "string",
                            },
                        },
                    ],
                    responses: {
                        200: {
                            description:
                                "Default address updated successfully",
                        },
                        400: {
                            description:
                                "Invalid address ID",
                        },
                        401: {
                            description:
                                "Authentication required",
                        },
                        404: {
                            description:
                                "Address not found",
                        },
                    },
                },
            },

            "/api/v1/users/me/addresses/{addressId}": {
                patch: {
                    tags: ["Addresses"],
                    summary: "Update an address",
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        {
                            name: "addressId",
                            in: "path",
                            required: true,
                            schema: { type: "string" },
                        },
                    ],
                    requestBody: {
                        required: true,
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/UpdateAddressRequest",
                                },
                            },
                        },
                    },
                    responses: {
                        200: {
                            description:
                                "Address updated successfully",
                        },
                        400: {
                            description:
                                "Invalid address or validation failed",
                        },
                        401: {
                            description:
                                "Authentication required",
                        },
                        404: {
                            description:
                                "Address not found",
                        },
                    },
                },
                delete: {
                    tags: ["Addresses"],
                    summary: "Delete an address",
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        {
                            name: "addressId",
                            in: "path",
                            required: true,
                            schema: { type: "string" },
                        },
                    ],
                    responses: {
                        200: {
                            description:
                                "Address deleted successfully",
                        },
                        400: {
                            description:
                                "Invalid address ID",
                        },
                        401: {
                            description:
                                "Authentication required",
                        },
                        404: {
                            description:
                                "Address not found",
                        },
                    },
                },
            },

            "/api/v1/users/sessions": {
                get: {
                    tags: ["Sessions"],
                    summary: "List active sessions",
                    security: [
                        {
                            bearerAuth: [],
                        },
                    ],
                    responses: {
                        200: {
                            description:
                                "Active sessions returned",
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        properties: {
                                            sessions: {
                                                type: "array",
                                                items: {
                                                    $ref: "#/components/schemas/Session",
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                        401: {
                            description:
                                "Authentication required",
                        },
                    },
                },

                delete: {
                    tags: ["Sessions"],
                    summary: "Revoke all sessions",
                    security: [
                        {
                            bearerAuth: [],
                        },
                    ],
                    responses: {
                        200: {
                            description:
                                "All sessions revoked",
                        },
                        401: {
                            description:
                                "Authentication required",
                        },
                    },
                },
            },

            "/api/v1/users/sessions/{sessionId}": {
                delete: {
                    tags: ["Sessions"],
                    summary: "Revoke one session",
                    security: [
                        {
                            bearerAuth: [],
                        },
                    ],
                    parameters: [
                        {
                            name: "sessionId",
                            in: "path",
                            required: true,
                            schema: {
                                type: "string",
                                format: "uuid",
                            },
                        },
                    ],
                    responses: {
                        200: {
                            description:
                                "Session revoked successfully",
                        },
                        400: {
                            description:
                                "Invalid session ID",
                        },
                        401: {
                            description:
                                "Authentication required",
                        },
                        404: {
                            description:
                                "Session not found",
                        },
                    },
                },
            },

            "/api/v1/users/{id}/status": {
                patch: {
                    tags: ["Admin"],
                    summary:
                        "Activate or deactivate a user",
                    security: [
                        {
                            bearerAuth: [],
                        },
                    ],
                    parameters: [
                        {
                            name: "id",
                            in: "path",
                            required: true,
                            schema: {
                                type: "string",
                            },
                        },
                    ],
                    requestBody: {
                        required: true,
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/UpdateUserStatusRequest",
                                },
                            },
                        },
                    },
                    responses: {
                        200: {
                            description:
                                "User status updated successfully",
                        },
                        400: {
                            description:
                                "Invalid user ID or request",
                        },
                        401: {
                            description:
                                "Authentication required",
                        },
                        403: {
                            description:
                                "Admin role required",
                        },
                        404: {
                            description:
                                "User not found",
                        },
                    },
                },
            },

            "/api/v1/users/admin-test": {
                get: {
                    tags: ["Admin"],
                    summary: "Test admin authorization",
                    security: [
                        {
                            bearerAuth: [],
                        },
                    ],
                    responses: {
                        200: {
                            description:
                                "Authenticated admin",
                        },
                        401: {
                            description:
                                "Authentication required",
                        },
                        403: {
                            description:
                                "Admin role required",
                        },
                    },
                },
            },

            "/api/v1/users/admin/admins": {
                post: {
                    tags: ["Admin"],
                    summary: "Create an ADMIN account",
                    security: [
                        {
                            bearerAuth: [],
                        },
                    ],
                    requestBody: {
                        required: true,
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/RegisterRequest",
                                },
                            },
                        },
                    },
                    responses: {
                        201: {
                            description: "Admin created successfully",
                        },
                        400: {
                            description: "Validation failed",
                        },
                        401: {
                            description: "Authentication required",
                        },
                        403: {
                            description: "SUPER_ADMIN role required",
                        },
                        409: {
                            description:
                                "Email or phone already exists",
                        },
                    },
                },
            },

            "/api/v1/users/admin/riders": {
                post: {
                    tags: ["Admin"],
                    summary: "Create a RIDER account",
                    security: [
                        {
                            bearerAuth: [],
                        },
                    ],
                    requestBody: {
                        required: true,
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/RegisterRequest",
                                },
                            },
                        },
                    },
                    responses: {
                        201: {
                            description: "Rider created successfully",
                        },
                        400: {
                            description: "Validation failed",
                        },
                        401: {
                            description: "Authentication required",
                        },
                        403: {
                            description:
                                "ADMIN or SUPER_ADMIN role required",
                        },
                        409: {
                            description:
                                "Email or phone already exists",
                        },
                    },
                },
            },
        },
    },

    apis: [
        "./src/app.ts",
        "./src/modules/**/*.ts",
    ],
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;