import swaggerJSDoc from "swagger-jsdoc";

const swaggerDefinition = {
    openapi: "3.0.3",

    info: {
        title: "Ezzewash Catalog Service API",
        version: "1.0.0",
        description:
            "REST API for branches, services, catalog items, service items, offers, reviews, and branch memberships.",
    },

    servers: [
        {
            url: "http://localhost:3002",
            description: "Local development",
        },
    ],

    tags: [
        {
            name: "Branches",
            description:
                "Branch management and public branch information.",
        },
        {
            name: "Services",
            description:
                "Laundry service management and branch services.",
        },
        {
            name: "Items",
            description:
                "Global catalog item management.",
        },
        {
            name: "Service Items",
            description:
                "Items associated with services.",
        },
        {
            name: "Offers",
            description:
                "Branch-specific offers.",
        },
        {
            name: "Reviews",
            description:
                "Customer service reviews and ratings.",
        },
        {
            name: "Branch Memberships",
            description:
                "Users assigned to branches.",
        },
    ],

    components: {
        securitySchemes: {
            bearerAuth: {
                type: "http",
                scheme: "bearer",
                bearerFormat: "JWT",
                description:
                    "Enter a valid JWT access token.",
            },
        },

        parameters: {
            BranchId: {
                name: "branchId",
                in: "path",
                required: true,
                schema: {
                    type: "string",
                },
            },

            ServiceId: {
                name: "serviceId",
                in: "path",
                required: true,
                schema: {
                    type: "string",
                },
            },

            ItemId: {
                name: "itemId",
                in: "path",
                required: true,
                schema: {
                    type: "string",
                },
            },

            ServiceItemId: {
                name: "serviceItemId",
                in: "path",
                required: true,
                schema: {
                    type: "string",
                },
            },

            OfferId: {
                name: "offerId",
                in: "path",
                required: true,
                schema: {
                    type: "string",
                },
            },

            ReviewId: {
                name: "reviewId",
                in: "path",
                required: true,
                schema: {
                    type: "string",
                },
            },

            MembershipId: {
                name: "membershipId",
                in: "path",
                required: true,
                schema: {
                    type: "string",
                },
            },

            UserId: {
                name: "userId",
                in: "path",
                required: true,
                schema: {
                    type: "string",
                },
            },
        },

        schemas: {
            // =================================================
            // COMMON
            // =================================================

            SuccessResponse: {
                type: "object",
                required: [
                    "success",
                    "requestId",
                ],
                properties: {
                    success: {
                        type: "boolean",
                        example: true,
                    },

                    message: {
                        type: "string",
                        example:
                            "Operation completed successfully",
                    },

                    data: {
                        type: "object",
                        additionalProperties: true,
                    },

                    requestId: {
                        type: "string",
                        format: "uuid",
                        example:
                            "7c1c2f8e-3b5c-4a7e-9d21-123456789abc",
                    },
                },
            },

            ErrorResponse: {
                type: "object",
                required: [
                    "success",
                    "message",
                    "requestId",
                ],
                properties: {
                    success: {
                        type: "boolean",
                        example: false,
                    },

                    message: {
                        type: "string",
                        example:
                            "Authentication required",
                    },

                    errors: {
                        type: "array",
                        items: {
                            type: "object",
                            additionalProperties: true,
                        },
                    },

                    requestId: {
                        type: "string",
                        format: "uuid",
                        example:
                            "7c1c2f8e-3b5c-4a7e-9d21-123456789abc",
                    },
                },
            },

            ValidationErrorResponse: {
                type: "object",
                required: [
                    "success",
                    "message",
                    "errors",
                    "requestId",
                ],
                properties: {
                    success: {
                        type: "boolean",
                        example: false,
                    },

                    message: {
                        type: "string",
                        example:
                            "Validation failed",
                    },

                    errors: {
                        type: "array",
                        items: {
                            type: "object",
                            required: [
                                "field",
                                "message",
                            ],
                            properties: {
                                field: {
                                    type: "string",
                                    example:
                                        "name",
                                },

                                message: {
                                    type: "string",
                                    example:
                                        "Service name must be at least 2 characters",
                                },
                            },
                        },
                    },

                    requestId: {
                        type: "string",
                        format: "uuid",
                        example:
                            "7c1c2f8e-3b5c-4a7e-9d21-123456789abc",
                    },
                },
            },

            // =================================================
            // BRANCH
            // =================================================

            Address: {
                type: "object",
                required: [
                    "addressLine1",
                    "city",
                    "country",
                ],
                properties: {
                    addressLine1: {
                        type: "string",
                        minLength: 2,
                        maxLength: 200,
                    },

                    addressLine2: {
                        type: "string",
                        maxLength: 200,
                    },

                    city: {
                        type: "string",
                        minLength: 2,
                        maxLength: 100,
                    },

                    state: {
                        type: "string",
                        maxLength: 100,
                    },

                    postalCode: {
                        type: "string",
                        maxLength: 20,
                    },

                    country: {
                        type: "string",
                        minLength: 2,
                        maxLength: 100,
                    },
                },
            },

            CreateBranch: {
                type: "object",
                required: [
                    "name",
                    "code",
                    "address",
                ],
                properties: {
                    name: {
                        type: "string",
                        minLength: 2,
                        maxLength: 100,
                    },

                    code: {
                        type: "string",
                        minLength: 2,
                        maxLength: 20,
                        example: "DHK01",
                    },

                    description: {
                        type: "string",
                        maxLength: 500,
                    },

                    address: {
                        $ref:
                            "#/components/schemas/Address",
                    },

                    phone: {
                        type: "string",
                        maxLength: 20,
                    },

                    email: {
                        type: "string",
                        format: "email",
                    },

                    isActive: {
                        type: "boolean",
                    },
                },
            },

            UpdateBranch: {
                type: "object",
                properties: {
                    name: {
                        type: "string",
                        minLength: 2,
                        maxLength: 100,
                    },

                    code: {
                        type: "string",
                        minLength: 2,
                        maxLength: 20,
                    },

                    description: {
                        type: "string",
                        maxLength: 500,
                    },

                    address: {
                        $ref:
                            "#/components/schemas/Address",
                    },

                    phone: {
                        type: "string",
                        maxLength: 20,
                    },

                    email: {
                        type: "string",
                        format: "email",
                    },

                    isActive: {
                        type: "boolean",
                    },
                },
            },

            BranchStatus: {
                type: "object",
                required: ["isActive"],
                properties: {
                    isActive: {
                        type: "boolean",
                    },
                },
            },

            // =================================================
            // SERVICE
            // =================================================

            CreateService: {
                type: "object",
                required: [
                    "branchId",
                    "name",
                    "code",
                ],
                properties: {
                    branchId: {
                        type: "string",
                    },

                    name: {
                        type: "string",
                        minLength: 2,
                        maxLength: 100,
                    },

                    code: {
                        type: "string",
                        minLength: 2,
                        maxLength: 30,
                        example: "WASH01",
                    },

                    description: {
                        type: "string",
                        maxLength: 500,
                    },

                    isActive: {
                        type: "boolean",
                    },
                },
            },

            UpdateService: {
                type: "object",
                properties: {
                    name: {
                        type: "string",
                        minLength: 2,
                        maxLength: 100,
                    },

                    code: {
                        type: "string",
                        minLength: 2,
                        maxLength: 30,
                    },

                    description: {
                        type: "string",
                        maxLength: 500,
                    },

                    isActive: {
                        type: "boolean",
                    },
                },
            },

            ServiceStatus: {
                type: "object",
                required: ["isActive"],
                properties: {
                    isActive: {
                        type: "boolean",
                    },
                },
            },

            // =================================================
            // ITEM
            // =================================================

            CreateItem: {
                type: "object",
                required: [
                    "name",
                    "code",
                ],
                properties: {
                    name: {
                        type: "string",
                        minLength: 2,
                        maxLength: 100,
                    },

                    code: {
                        type: "string",
                        minLength: 2,
                        maxLength: 30,
                        example: "SHIRT",
                    },

                    description: {
                        type: "string",
                        maxLength: 500,
                    },

                    isActive: {
                        type: "boolean",
                    },
                },
            },

            UpdateItem: {
                type: "object",
                properties: {
                    name: {
                        type: "string",
                        minLength: 2,
                        maxLength: 100,
                    },

                    code: {
                        type: "string",
                        minLength: 2,
                        maxLength: 30,
                    },

                    description: {
                        type: "string",
                        maxLength: 500,
                    },

                    isActive: {
                        type: "boolean",
                    },
                },
            },

            ItemStatus: {
                type: "object",
                required: ["isActive"],
                properties: {
                    isActive: {
                        type: "boolean",
                    },
                },
            },

            // =================================================
            // SERVICE ITEM
            // =================================================

            CreateServiceItem: {
                type: "object",
                required: [
                    "serviceId",
                    "itemId",
                    "price",
                ],
                properties: {
                    serviceId: {
                        type: "string",
                    },

                    itemId: {
                        type: "string",
                    },

                    price: {
                        type: "number",
                        minimum: 0,
                    },

                    currency: {
                        type: "string",
                        minLength: 3,
                        maxLength: 3,
                        example: "BDT",
                    },

                    isActive: {
                        type: "boolean",
                    },
                },
            },

            UpdateServiceItem: {
                type: "object",
                properties: {
                    price: {
                        type: "number",
                        minimum: 0,
                    },

                    currency: {
                        type: "string",
                        minLength: 3,
                        maxLength: 3,
                    },

                    isActive: {
                        type: "boolean",
                    },
                },
            },

            // =================================================
            // OFFER
            // =================================================

            CreateOffer: {
                type: "object",
                required: [
                    "branchId",
                    "name",
                    "discountType",
                    "discountValue",
                    "startAt",
                    "endAt",
                ],
                properties: {
                    branchId: {
                        type: "string",
                    },

                    name: {
                        type: "string",
                        minLength: 2,
                        maxLength: 100,
                    },

                    description: {
                        type: "string",
                        maxLength: 500,
                    },

                    discountType: {
                        type: "string",
                        enum: [
                            "PERCENTAGE",
                            "FIXED",
                        ],
                    },

                    discountValue: {
                        type: "number",
                        exclusiveMinimum: 0,
                    },

                    minimumOrderAmount: {
                        type: "number",
                        minimum: 0,
                    },

                    maximumDiscountAmount: {
                        type: "number",
                        minimum: 0,
                    },

                    serviceIds: {
                        type: "array",
                        items: {
                            type: "string",
                        },
                    },

                    startAt: {
                        type: "string",
                        format: "date-time",
                    },

                    endAt: {
                        type: "string",
                        format: "date-time",
                    },

                    isActive: {
                        type: "boolean",
                    },
                },
            },

            UpdateOffer: {
                type: "object",
                properties: {
                    name: {
                        type: "string",
                        minLength: 2,
                        maxLength: 100,
                    },

                    description: {
                        type: "string",
                        maxLength: 500,
                    },

                    discountType: {
                        type: "string",
                        enum: [
                            "PERCENTAGE",
                            "FIXED",
                        ],
                    },

                    discountValue: {
                        type: "number",
                        exclusiveMinimum: 0,
                    },

                    minimumOrderAmount: {
                        type: "number",
                        minimum: 0,
                    },

                    maximumDiscountAmount: {
                        type: "number",
                        minimum: 0,
                    },

                    serviceIds: {
                        type: "array",
                        items: {
                            type: "string",
                        },
                    },

                    startAt: {
                        type: "string",
                        format: "date-time",
                    },

                    endAt: {
                        type: "string",
                        format: "date-time",
                    },

                    isActive: {
                        type: "boolean",
                    },
                },
            },

            OfferStatus: {
                type: "object",
                required: ["isActive"],
                properties: {
                    isActive: {
                        type: "boolean",
                    },
                },
            },

            // =================================================
            // REVIEW
            // =================================================

            CreateReview: {
                type: "object",
                required: [
                    "serviceId",
                    "rating",
                ],
                properties: {
                    serviceId: {
                        type: "string",
                    },

                    rating: {
                        type: "integer",
                        minimum: 1,
                        maximum: 5,
                    },

                    comment: {
                        type: "string",
                        maxLength: 1000,
                    },
                },
            },

            UpdateReview: {
                type: "object",
                properties: {
                    rating: {
                        type: "integer",
                        minimum: 1,
                        maximum: 5,
                    },

                    comment: {
                        type: "string",
                        maxLength: 1000,
                    },
                },
            },

            // =================================================
            // BRANCH MEMBERSHIP
            // =================================================

            CreateBranchMembership: {
                type: "object",
                required: [
                    "userId",
                    "branchId",
                ],
                properties: {
                    userId: {
                        type: "string",
                    },

                    branchId: {
                        type: "string",
                    },

                    isActive: {
                        type: "boolean",
                    },
                },
            },

            UpdateBranchMembership: {
                type: "object",
                required: ["isActive"],
                properties: {
                    isActive: {
                        type: "boolean",
                    },
                },
            },
        },

        // =====================================================
        // REUSABLE RESPONSES
        // =====================================================

        responses: {
            BadRequest: {
                description:
                    "Bad request or validation error.",
                content: {
                    "application/json": {
                        schema: {
                            $ref:
                                "#/components/schemas/ValidationErrorResponse",
                        },
                    },
                },
            },

            Unauthorized: {
                description:
                    "Authentication is required or the access token is invalid.",
                content: {
                    "application/json": {
                        schema: {
                            $ref:
                                "#/components/schemas/ErrorResponse",
                        },
                    },
                },
            },

            Forbidden: {
                description:
                    "The authenticated user is not allowed to perform this operation.",
                content: {
                    "application/json": {
                        schema: {
                            $ref:
                                "#/components/schemas/ErrorResponse",
                        },
                    },
                },
            },

            NotFound: {
                description:
                    "The requested resource was not found.",
                content: {
                    "application/json": {
                        schema: {
                            $ref:
                                "#/components/schemas/ErrorResponse",
                        },
                    },
                },
            },

            Conflict: {
                description:
                    "The request conflicts with existing data.",
                content: {
                    "application/json": {
                        schema: {
                            $ref:
                                "#/components/schemas/ErrorResponse",
                        },
                    },
                },
            },
        },
    },

    paths: {
        // =====================================================
        // BRANCHES
        // =====================================================

        "/api/v1/branches": {
            get: {
                tags: ["Branches"],
                summary: "Get all branches",

                responses: {
                    "200": {
                        description:
                            "Branches retrieved successfully.",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref:
                                        "#/components/schemas/SuccessResponse",
                                },
                            },
                        },
                    },
                },
            },

            post: {
                tags: ["Branches"],
                summary: "Create a branch",

                security: [
                    {
                        bearerAuth: [],
                    },
                ],

                description:
                    "Requires SUPER_ADMIN.",

                requestBody: {
                    required: true,

                    content: {
                        "application/json": {
                            schema: {
                                $ref:
                                    "#/components/schemas/CreateBranch",
                            },
                        },
                    },
                },

                responses: {
                    "201": {
                        description:
                            "Branch created successfully.",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref:
                                        "#/components/schemas/SuccessResponse",
                                },
                            },
                        },
                    },

                    "400": {
                        $ref:
                            "#/components/responses/BadRequest",
                    },

                    "401": {
                        $ref:
                            "#/components/responses/Unauthorized",
                    },

                    "403": {
                        $ref:
                            "#/components/responses/Forbidden",
                    },
                },
            },
        },

        "/api/v1/branches/{branchId}": {
            get: {
                tags: ["Branches"],
                summary: "Get a branch",

                parameters: [
                    {
                        $ref:
                            "#/components/parameters/BranchId",
                    },
                ],

                responses: {
                    "200": {
                        description:
                            "Branch retrieved successfully.",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref:
                                        "#/components/schemas/SuccessResponse",
                                },
                            },
                        },
                    },

                    "404": {
                        $ref:
                            "#/components/responses/NotFound",
                    },
                },
            },

            patch: {
                tags: ["Branches"],
                summary: "Update a branch",

                security: [
                    {
                        bearerAuth: [],
                    },
                ],

                description:
                    "Requires SUPER_ADMIN.",

                parameters: [
                    {
                        $ref:
                            "#/components/parameters/BranchId",
                    },
                ],

                requestBody: {
                    required: true,

                    content: {
                        "application/json": {
                            schema: {
                                $ref:
                                    "#/components/schemas/UpdateBranch",
                            },
                        },
                    },
                },

                responses: {
                    "200": {
                        description:
                            "Branch updated successfully.",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref:
                                        "#/components/schemas/SuccessResponse",
                                },
                            },
                        },
                    },

                    "400": {
                        $ref:
                            "#/components/responses/BadRequest",
                    },

                    "401": {
                        $ref:
                            "#/components/responses/Unauthorized",
                    },

                    "403": {
                        $ref:
                            "#/components/responses/Forbidden",
                    },

                    "404": {
                        $ref:
                            "#/components/responses/NotFound",
                    },
                },
            },

            delete: {
                tags: ["Branches"],
                summary: "Delete a branch",

                security: [
                    {
                        bearerAuth: [],
                    },
                ],

                description:
                    "Requires SUPER_ADMIN.",

                parameters: [
                    {
                        $ref:
                            "#/components/parameters/BranchId",
                    },
                ],

                responses: {
                    "200": {
                        description:
                            "Branch deleted successfully.",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref:
                                        "#/components/schemas/SuccessResponse",
                                },
                            },
                        },
                    },

                    "401": {
                        $ref:
                            "#/components/responses/Unauthorized",
                    },

                    "403": {
                        $ref:
                            "#/components/responses/Forbidden",
                    },

                    "404": {
                        $ref:
                            "#/components/responses/NotFound",
                    },
                },
            },
        },

        "/api/v1/branches/{branchId}/status": {
            patch: {
                tags: ["Branches"],
                summary: "Update branch status",

                security: [
                    {
                        bearerAuth: [],
                    },
                ],

                description:
                    "Requires SUPER_ADMIN.",

                parameters: [
                    {
                        $ref:
                            "#/components/parameters/BranchId",
                    },
                ],

                requestBody: {
                    required: true,

                    content: {
                        "application/json": {
                            schema: {
                                $ref:
                                    "#/components/schemas/BranchStatus",
                            },
                        },
                    },
                },

                responses: {
                    "200": {
                        description:
                            "Branch status updated.",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref:
                                        "#/components/schemas/SuccessResponse",
                                },
                            },
                        },
                    },

                    "400": {
                        $ref:
                            "#/components/responses/BadRequest",
                    },

                    "401": {
                        $ref:
                            "#/components/responses/Unauthorized",
                    },

                    "403": {
                        $ref:
                            "#/components/responses/Forbidden",
                    },

                    "404": {
                        $ref:
                            "#/components/responses/NotFound",
                    },
                },
            },
        },

        // =====================================================
        // SERVICES
        // =====================================================

        "/api/v1/services/branch/{branchId}": {
            get: {
                tags: ["Services"],
                summary: "Get services by branch",

                parameters: [
                    {
                        $ref:
                            "#/components/parameters/BranchId",
                    },
                ],

                responses: {
                    "200": {
                        description:
                            "Services retrieved successfully.",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref:
                                        "#/components/schemas/SuccessResponse",
                                },
                            },
                        },
                    },
                },
            },
        },

        "/api/v1/services": {
            post: {
                tags: ["Services"],
                summary: "Create a service",

                security: [
                    {
                        bearerAuth: [],
                    },
                ],

                description:
                    "Requires authentication and branch management access.",

                requestBody: {
                    required: true,

                    content: {
                        "application/json": {
                            schema: {
                                $ref:
                                    "#/components/schemas/CreateService",
                            },
                        },
                    },
                },

                responses: {
                    "201": {
                        description:
                            "Service created successfully.",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref:
                                        "#/components/schemas/SuccessResponse",
                                },
                            },
                        },
                    },

                    "400": {
                        $ref:
                            "#/components/responses/BadRequest",
                    },

                    "401": {
                        $ref:
                            "#/components/responses/Unauthorized",
                    },

                    "403": {
                        $ref:
                            "#/components/responses/Forbidden",
                    },
                },
            },
        },

        "/api/v1/services/{serviceId}": {
            get: {
                tags: ["Services"],
                summary: "Get a service",

                parameters: [
                    {
                        $ref:
                            "#/components/parameters/ServiceId",
                    },
                ],

                responses: {
                    "200": {
                        description:
                            "Service retrieved successfully.",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref:
                                        "#/components/schemas/SuccessResponse",
                                },
                            },
                        },
                    },

                    "404": {
                        $ref:
                            "#/components/responses/NotFound",
                    },
                },
            },

            patch: {
                tags: ["Services"],
                summary: "Update a service",

                security: [
                    {
                        bearerAuth: [],
                    },
                ],

                description:
                    "Requires authentication and branch management access.",

                parameters: [
                    {
                        $ref:
                            "#/components/parameters/ServiceId",
                    },
                ],

                requestBody: {
                    required: true,

                    content: {
                        "application/json": {
                            schema: {
                                $ref:
                                    "#/components/schemas/UpdateService",
                            },
                        },
                    },
                },

                responses: {
                    "200": {
                        description:
                            "Service updated successfully.",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref:
                                        "#/components/schemas/SuccessResponse",
                                },
                            },
                        },
                    },

                    "400": {
                        $ref:
                            "#/components/responses/BadRequest",
                    },

                    "401": {
                        $ref:
                            "#/components/responses/Unauthorized",
                    },

                    "403": {
                        $ref:
                            "#/components/responses/Forbidden",
                    },

                    "404": {
                        $ref:
                            "#/components/responses/NotFound",
                    },
                },
            },

            delete: {
                tags: ["Services"],
                summary: "Delete a service",

                security: [
                    {
                        bearerAuth: [],
                    },
                ],

                description:
                    "Requires authentication and branch management access.",

                parameters: [
                    {
                        $ref:
                            "#/components/parameters/ServiceId",
                    },
                ],

                responses: {
                    "200": {
                        description:
                            "Service deleted successfully.",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref:
                                        "#/components/schemas/SuccessResponse",
                                },
                            },
                        },
                    },

                    "401": {
                        $ref:
                            "#/components/responses/Unauthorized",
                    },

                    "403": {
                        $ref:
                            "#/components/responses/Forbidden",
                    },

                    "404": {
                        $ref:
                            "#/components/responses/NotFound",
                    },
                },
            },
        },

        "/api/v1/services/{serviceId}/status": {
            patch: {
                tags: ["Services"],
                summary: "Update service status",

                security: [
                    {
                        bearerAuth: [],
                    },
                ],

                description:
                    "Requires authentication and branch management access.",

                parameters: [
                    {
                        $ref:
                            "#/components/parameters/ServiceId",
                    },
                ],

                requestBody: {
                    required: true,

                    content: {
                        "application/json": {
                            schema: {
                                $ref:
                                    "#/components/schemas/ServiceStatus",
                            },
                        },
                    },
                },

                responses: {
                    "200": {
                        description:
                            "Service status updated.",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref:
                                        "#/components/schemas/SuccessResponse",
                                },
                            },
                        },
                    },

                    "400": {
                        $ref:
                            "#/components/responses/BadRequest",
                    },

                    "401": {
                        $ref:
                            "#/components/responses/Unauthorized",
                    },

                    "403": {
                        $ref:
                            "#/components/responses/Forbidden",
                    },

                    "404": {
                        $ref:
                            "#/components/responses/NotFound",
                    },
                },
            },
        },

        // =====================================================
        // ITEMS
        // =====================================================

        "/api/v1/items": {
            get: {
                tags: ["Items"],
                summary: "Get all catalog items",

                responses: {
                    "200": {
                        description:
                            "Items retrieved successfully.",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref:
                                        "#/components/schemas/SuccessResponse",
                                },
                            },
                        },
                    },
                },
            },

            post: {
                tags: ["Items"],
                summary: "Create a catalog item",

                security: [
                    {
                        bearerAuth: [],
                    },
                ],

                description:
                    "Requires SUPER_ADMIN authorization.",

                requestBody: {
                    required: true,

                    content: {
                        "application/json": {
                            schema: {
                                $ref:
                                    "#/components/schemas/CreateItem",
                            },
                        },
                    },
                },

                responses: {
                    "201": {
                        description:
                            "Item created successfully.",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref:
                                        "#/components/schemas/SuccessResponse",
                                },
                            },
                        },
                    },

                    "400": {
                        $ref:
                            "#/components/responses/BadRequest",
                    },

                    "401": {
                        $ref:
                            "#/components/responses/Unauthorized",
                    },

                    "403": {
                        $ref:
                            "#/components/responses/Forbidden",
                    },
                },
            },
        },

        "/api/v1/items/{itemId}": {
            get: {
                tags: ["Items"],
                summary: "Get a catalog item",

                parameters: [
                    {
                        $ref:
                            "#/components/parameters/ItemId",
                    },
                ],

                responses: {
                    "200": {
                        description:
                            "Item retrieved successfully.",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref:
                                        "#/components/schemas/SuccessResponse",
                                },
                            },
                        },
                    },

                    "404": {
                        $ref:
                            "#/components/responses/NotFound",
                    },
                },
            },

            patch: {
                tags: ["Items"],
                summary: "Update a catalog item",

                security: [
                    {
                        bearerAuth: [],
                    },
                ],

                description:
                    "Requires SUPER_ADMIN authorization.",

                parameters: [
                    {
                        $ref:
                            "#/components/parameters/ItemId",
                    },
                ],

                requestBody: {
                    required: true,

                    content: {
                        "application/json": {
                            schema: {
                                $ref:
                                    "#/components/schemas/UpdateItem",
                            },
                        },
                    },
                },

                responses: {
                    "200": {
                        description:
                            "Item updated successfully.",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref:
                                        "#/components/schemas/SuccessResponse",
                                },
                            },
                        },
                    },

                    "400": {
                        $ref:
                            "#/components/responses/BadRequest",
                    },

                    "401": {
                        $ref:
                            "#/components/responses/Unauthorized",
                    },

                    "403": {
                        $ref:
                            "#/components/responses/Forbidden",
                    },

                    "404": {
                        $ref:
                            "#/components/responses/NotFound",
                    },
                },
            },

            delete: {
                tags: ["Items"],
                summary: "Delete a catalog item",

                security: [
                    {
                        bearerAuth: [],
                    },
                ],

                description:
                    "Requires SUPER_ADMIN authorization.",

                parameters: [
                    {
                        $ref:
                            "#/components/parameters/ItemId",
                    },
                ],

                responses: {
                    "200": {
                        description:
                            "Item deleted successfully.",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref:
                                        "#/components/schemas/SuccessResponse",
                                },
                            },
                        },
                    },

                    "401": {
                        $ref:
                            "#/components/responses/Unauthorized",
                    },

                    "403": {
                        $ref:
                            "#/components/responses/Forbidden",
                    },

                    "404": {
                        $ref:
                            "#/components/responses/NotFound",
                    },
                },
            },
        },

        "/api/v1/items/{itemId}/status": {
            patch: {
                tags: ["Items"],
                summary: "Update item status",

                security: [
                    {
                        bearerAuth: [],
                    },
                ],

                description:
                    "Requires SUPER_ADMIN authorization.",

                parameters: [
                    {
                        $ref:
                            "#/components/parameters/ItemId",
                    },
                ],

                requestBody: {
                    required: true,

                    content: {
                        "application/json": {
                            schema: {
                                $ref:
                                    "#/components/schemas/ItemStatus",
                            },
                        },
                    },
                },

                responses: {
                    "200": {
                        description:
                            "Item status updated.",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref:
                                        "#/components/schemas/SuccessResponse",
                                },
                            },
                        },
                    },

                    "400": {
                        $ref:
                            "#/components/responses/BadRequest",
                    },

                    "401": {
                        $ref:
                            "#/components/responses/Unauthorized",
                    },

                    "403": {
                        $ref:
                            "#/components/responses/Forbidden",
                    },

                    "404": {
                        $ref:
                            "#/components/responses/NotFound",
                    },
                },
            },
        },

        // =====================================================
        // SERVICE ITEMS
        // =====================================================

        "/api/v1/service-items/service/{serviceId}": {
            get: {
                tags: ["Service Items"],
                summary: "Get items for a service",

                parameters: [
                    {
                        $ref:
                            "#/components/parameters/ServiceId",
                    },
                ],

                responses: {
                    "200": {
                        description:
                            "Service items retrieved successfully.",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref:
                                        "#/components/schemas/SuccessResponse",
                                },
                            },
                        },
                    },
                },
            },
        },

        "/api/v1/service-items": {
            post: {
                tags: ["Service Items"],
                summary: "Create a service item",

                security: [
                    {
                        bearerAuth: [],
                    },
                ],

                description:
                    "Requires authentication and branch management access.",

                requestBody: {
                    required: true,

                    content: {
                        "application/json": {
                            schema: {
                                $ref:
                                    "#/components/schemas/CreateServiceItem",
                            },
                        },
                    },
                },

                responses: {
                    "201": {
                        description:
                            "Service item created successfully.",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref:
                                        "#/components/schemas/SuccessResponse",
                                },
                            },
                        },
                    },

                    "400": {
                        $ref:
                            "#/components/responses/BadRequest",
                    },

                    "401": {
                        $ref:
                            "#/components/responses/Unauthorized",
                    },

                    "403": {
                        $ref:
                            "#/components/responses/Forbidden",
                    },
                },
            },
        },

        "/api/v1/service-items/{serviceItemId}": {
            get: {
                tags: ["Service Items"],
                summary: "Get a service item",

                parameters: [
                    {
                        $ref:
                            "#/components/parameters/ServiceItemId",
                    },
                ],

                responses: {
                    "200": {
                        description:
                            "Service item retrieved successfully.",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref:
                                        "#/components/schemas/SuccessResponse",
                                },
                            },
                        },
                    },

                    "404": {
                        $ref:
                            "#/components/responses/NotFound",
                    },
                },
            },

            patch: {
                tags: ["Service Items"],
                summary: "Update a service item",

                security: [
                    {
                        bearerAuth: [],
                    },
                ],

                description:
                    "Requires authentication and branch management access.",

                parameters: [
                    {
                        $ref:
                            "#/components/parameters/ServiceItemId",
                    },
                ],

                requestBody: {
                    required: true,

                    content: {
                        "application/json": {
                            schema: {
                                $ref:
                                    "#/components/schemas/UpdateServiceItem",
                            },
                        },
                    },
                },

                responses: {
                    "200": {
                        description:
                            "Service item updated successfully.",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref:
                                        "#/components/schemas/SuccessResponse",
                                },
                            },
                        },
                    },

                    "400": {
                        $ref:
                            "#/components/responses/BadRequest",
                    },

                    "401": {
                        $ref:
                            "#/components/responses/Unauthorized",
                    },

                    "403": {
                        $ref:
                            "#/components/responses/Forbidden",
                    },

                    "404": {
                        $ref:
                            "#/components/responses/NotFound",
                    },
                },
            },

            delete: {
                tags: ["Service Items"],
                summary: "Delete a service item",

                security: [
                    {
                        bearerAuth: [],
                    },
                ],

                description:
                    "Requires authentication and branch management access.",

                parameters: [
                    {
                        $ref:
                            "#/components/parameters/ServiceItemId",
                    },
                ],

                responses: {
                    "200": {
                        description:
                            "Service item deleted successfully.",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref:
                                        "#/components/schemas/SuccessResponse",
                                },
                            },
                        },
                    },

                    "401": {
                        $ref:
                            "#/components/responses/Unauthorized",
                    },

                    "403": {
                        $ref:
                            "#/components/responses/Forbidden",
                    },

                    "404": {
                        $ref:
                            "#/components/responses/NotFound",
                    },
                },
            },
        },

        // =====================================================
        // OFFERS
        // =====================================================

        "/api/v1/offers/branch/{branchId}/active": {
            get: {
                tags: ["Offers"],
                summary: "Get active offers for a branch",

                parameters: [
                    {
                        $ref:
                            "#/components/parameters/BranchId",
                    },
                ],

                responses: {
                    "200": {
                        description:
                            "Active offers retrieved successfully.",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref:
                                        "#/components/schemas/SuccessResponse",
                                },
                            },
                        },
                    },
                },
            },
        },

        "/api/v1/offers/branch/{branchId}": {
            get: {
                tags: ["Offers"],
                summary: "Get offers for a branch",

                parameters: [
                    {
                        $ref:
                            "#/components/parameters/BranchId",
                    },
                ],

                responses: {
                    "200": {
                        description:
                            "Offers retrieved successfully.",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref:
                                        "#/components/schemas/SuccessResponse",
                                },
                            },
                        },
                    },
                },
            },
        },

        "/api/v1/offers": {
            post: {
                tags: ["Offers"],
                summary: "Create an offer",

                security: [
                    {
                        bearerAuth: [],
                    },
                ],

                description:
                    "Requires authentication and branch management access.",

                requestBody: {
                    required: true,

                    content: {
                        "application/json": {
                            schema: {
                                $ref:
                                    "#/components/schemas/CreateOffer",
                            },
                        },
                    },
                },

                responses: {
                    "201": {
                        description:
                            "Offer created successfully.",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref:
                                        "#/components/schemas/SuccessResponse",
                                },
                            },
                        },
                    },

                    "400": {
                        $ref:
                            "#/components/responses/BadRequest",
                    },

                    "401": {
                        $ref:
                            "#/components/responses/Unauthorized",
                    },

                    "403": {
                        $ref:
                            "#/components/responses/Forbidden",
                    },
                },
            },
        },

        "/api/v1/offers/{offerId}": {
            get: {
                tags: ["Offers"],
                summary: "Get an offer",

                parameters: [
                    {
                        $ref:
                            "#/components/parameters/OfferId",
                    },
                ],

                responses: {
                    "200": {
                        description:
                            "Offer retrieved successfully.",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref:
                                        "#/components/schemas/SuccessResponse",
                                },
                            },
                        },
                    },

                    "404": {
                        $ref:
                            "#/components/responses/NotFound",
                    },
                },
            },

            patch: {
                tags: ["Offers"],
                summary: "Update an offer",

                security: [
                    {
                        bearerAuth: [],
                    },
                ],

                description:
                    "Requires authentication and branch management access.",

                parameters: [
                    {
                        $ref:
                            "#/components/parameters/OfferId",
                    },
                ],

                requestBody: {
                    required: true,

                    content: {
                        "application/json": {
                            schema: {
                                $ref:
                                    "#/components/schemas/UpdateOffer",
                            },
                        },
                    },
                },

                responses: {
                    "200": {
                        description:
                            "Offer updated successfully.",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref:
                                        "#/components/schemas/SuccessResponse",
                                },
                            },
                        },
                    },

                    "400": {
                        $ref:
                            "#/components/responses/BadRequest",
                    },

                    "401": {
                        $ref:
                            "#/components/responses/Unauthorized",
                    },

                    "403": {
                        $ref:
                            "#/components/responses/Forbidden",
                    },

                    "404": {
                        $ref:
                            "#/components/responses/NotFound",
                    },
                },
            },

            delete: {
                tags: ["Offers"],
                summary: "Delete an offer",

                security: [
                    {
                        bearerAuth: [],
                    },
                ],

                description:
                    "Requires authentication and branch management access.",

                parameters: [
                    {
                        $ref:
                            "#/components/parameters/OfferId",
                    },
                ],

                responses: {
                    "200": {
                        description:
                            "Offer deleted successfully.",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref:
                                        "#/components/schemas/SuccessResponse",
                                },
                            },
                        },
                    },

                    "401": {
                        $ref:
                            "#/components/responses/Unauthorized",
                    },

                    "403": {
                        $ref:
                            "#/components/responses/Forbidden",
                    },

                    "404": {
                        $ref:
                            "#/components/responses/NotFound",
                    },
                },
            },
        },

        "/api/v1/offers/{offerId}/status": {
            patch: {
                tags: ["Offers"],
                summary: "Update offer status",

                security: [
                    {
                        bearerAuth: [],
                    },
                ],

                description:
                    "Requires authentication and branch management access.",

                parameters: [
                    {
                        $ref:
                            "#/components/parameters/OfferId",
                    },
                ],

                requestBody: {
                    required: true,

                    content: {
                        "application/json": {
                            schema: {
                                $ref:
                                    "#/components/schemas/OfferStatus",
                            },
                        },
                    },
                },

                responses: {
                    "200": {
                        description:
                            "Offer status updated.",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref:
                                        "#/components/schemas/SuccessResponse",
                                },
                            },
                        },
                    },

                    "400": {
                        $ref:
                            "#/components/responses/BadRequest",
                    },

                    "401": {
                        $ref:
                            "#/components/responses/Unauthorized",
                    },

                    "403": {
                        $ref:
                            "#/components/responses/Forbidden",
                    },

                    "404": {
                        $ref:
                            "#/components/responses/NotFound",
                    },
                },
            },
        },

        // =====================================================
        // REVIEWS
        // =====================================================

        "/api/v1/reviews/service/{serviceId}/rating": {
            get: {
                tags: ["Reviews"],
                summary: "Get service rating",

                parameters: [
                    {
                        $ref:
                            "#/components/parameters/ServiceId",
                    },
                ],

                responses: {
                    "200": {
                        description:
                            "Service rating retrieved successfully.",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref:
                                        "#/components/schemas/SuccessResponse",
                                },
                            },
                        },
                    },

                    "404": {
                        $ref:
                            "#/components/responses/NotFound",
                    },
                },
            },
        },

        "/api/v1/reviews/service/{serviceId}": {
            get: {
                tags: ["Reviews"],
                summary: "Get service reviews",

                parameters: [
                    {
                        $ref:
                            "#/components/parameters/ServiceId",
                    },
                ],

                responses: {
                    "200": {
                        description:
                            "Service reviews retrieved successfully.",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref:
                                        "#/components/schemas/SuccessResponse",
                                },
                            },
                        },
                    },

                    "404": {
                        $ref:
                            "#/components/responses/NotFound",
                    },
                },
            },
        },

        "/api/v1/reviews": {
            post: {
                tags: ["Reviews"],
                summary: "Create a review",

                security: [
                    {
                        bearerAuth: [],
                    },
                ],

                description:
                    "The authenticated user's ID is taken from the JWT. userId must not be supplied in the request body.",

                requestBody: {
                    required: true,

                    content: {
                        "application/json": {
                            schema: {
                                $ref:
                                    "#/components/schemas/CreateReview",
                            },
                        },
                    },
                },

                responses: {
                    "201": {
                        description:
                            "Review created successfully.",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref:
                                        "#/components/schemas/SuccessResponse",
                                },
                            },
                        },
                    },

                    "400": {
                        $ref:
                            "#/components/responses/BadRequest",
                    },

                    "401": {
                        $ref:
                            "#/components/responses/Unauthorized",
                    },

                    "403": {
                        $ref:
                            "#/components/responses/Forbidden",
                    },
                },
            },
        },

        "/api/v1/reviews/{reviewId}": {
            get: {
                tags: ["Reviews"],
                summary: "Get a review",

                parameters: [
                    {
                        $ref:
                            "#/components/parameters/ReviewId",
                    },
                ],

                responses: {
                    "200": {
                        description:
                            "Review retrieved successfully.",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref:
                                        "#/components/schemas/SuccessResponse",
                                },
                            },
                        },
                    },

                    "404": {
                        $ref:
                            "#/components/responses/NotFound",
                    },
                },
            },

            patch: {
                tags: ["Reviews"],
                summary: "Update your review",

                security: [
                    {
                        bearerAuth: [],
                    },
                ],

                description:
                    "Only the owner of the review can update it.",

                parameters: [
                    {
                        $ref:
                            "#/components/parameters/ReviewId",
                    },
                ],

                requestBody: {
                    required: true,

                    content: {
                        "application/json": {
                            schema: {
                                $ref:
                                    "#/components/schemas/UpdateReview",
                            },
                        },
                    },
                },

                responses: {
                    "200": {
                        description:
                            "Review updated successfully.",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref:
                                        "#/components/schemas/SuccessResponse",
                                },
                            },
                        },
                    },

                    "400": {
                        $ref:
                            "#/components/responses/BadRequest",
                    },

                    "401": {
                        $ref:
                            "#/components/responses/Unauthorized",
                    },

                    "403": {
                        $ref:
                            "#/components/responses/Forbidden",
                    },

                    "404": {
                        $ref:
                            "#/components/responses/NotFound",
                    },
                },
            },

            delete: {
                tags: ["Reviews"],
                summary: "Delete your review",

                security: [
                    {
                        bearerAuth: [],
                    },
                ],

                description:
                    "Only the owner of the review can delete it.",

                parameters: [
                    {
                        $ref:
                            "#/components/parameters/ReviewId",
                    },
                ],

                responses: {
                    "200": {
                        description:
                            "Review deleted successfully.",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref:
                                        "#/components/schemas/SuccessResponse",
                                },
                            },
                        },
                    },

                    "401": {
                        $ref:
                            "#/components/responses/Unauthorized",
                    },

                    "403": {
                        $ref:
                            "#/components/responses/Forbidden",
                    },

                    "404": {
                        $ref:
                            "#/components/responses/NotFound",
                    },
                },
            },
        },

        // =====================================================
        // BRANCH MEMBERSHIPS
        // =====================================================

        "/api/v1/branch-memberships/user/{userId}": {
            get: {
                tags: ["Branch Memberships"],
                summary: "Get memberships for a user",

                security: [
                    {
                        bearerAuth: [],
                    },
                ],

                description:
                    "Branch membership management is restricted to authorized administrators.",

                parameters: [
                    {
                        $ref:
                            "#/components/parameters/UserId",
                    },
                ],

                responses: {
                    "200": {
                        description:
                            "Memberships retrieved successfully.",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref:
                                        "#/components/schemas/SuccessResponse",
                                },
                            },
                        },
                    },

                    "401": {
                        $ref:
                            "#/components/responses/Unauthorized",
                    },

                    "403": {
                        $ref:
                            "#/components/responses/Forbidden",
                    },
                },
            },
        },

        "/api/v1/branch-memberships/branch/{branchId}": {
            get: {
                tags: ["Branch Memberships"],
                summary: "Get memberships for a branch",

                security: [
                    {
                        bearerAuth: [],
                    },
                ],

                parameters: [
                    {
                        $ref:
                            "#/components/parameters/BranchId",
                    },
                ],

                responses: {
                    "200": {
                        description:
                            "Memberships retrieved successfully.",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref:
                                        "#/components/schemas/SuccessResponse",
                                },
                            },
                        },
                    },

                    "401": {
                        $ref:
                            "#/components/responses/Unauthorized",
                    },

                    "403": {
                        $ref:
                            "#/components/responses/Forbidden",
                    },
                },
            },
        },

        "/api/v1/branch-memberships/{membershipId}": {
            get: {
                tags: ["Branch Memberships"],
                summary: "Get a branch membership",

                security: [
                    {
                        bearerAuth: [],
                    },
                ],

                parameters: [
                    {
                        $ref:
                            "#/components/parameters/MembershipId",
                    },
                ],

                responses: {
                    "200": {
                        description:
                            "Membership retrieved successfully.",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref:
                                        "#/components/schemas/SuccessResponse",
                                },
                            },
                        },
                    },

                    "401": {
                        $ref:
                            "#/components/responses/Unauthorized",
                    },

                    "403": {
                        $ref:
                            "#/components/responses/Forbidden",
                    },

                    "404": {
                        $ref:
                            "#/components/responses/NotFound",
                    },
                },
            },

            patch: {
                tags: ["Branch Memberships"],
                summary: "Update a branch membership",

                security: [
                    {
                        bearerAuth: [],
                    },
                ],

                parameters: [
                    {
                        $ref:
                            "#/components/parameters/MembershipId",
                    },
                ],

                requestBody: {
                    required: true,

                    content: {
                        "application/json": {
                            schema: {
                                $ref:
                                    "#/components/schemas/UpdateBranchMembership",
                            },
                        },
                    },
                },

                responses: {
                    "200": {
                        description:
                            "Membership updated successfully.",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref:
                                        "#/components/schemas/SuccessResponse",
                                },
                            },
                        },
                    },

                    "400": {
                        $ref:
                            "#/components/responses/BadRequest",
                    },

                    "401": {
                        $ref:
                            "#/components/responses/Unauthorized",
                    },

                    "403": {
                        $ref:
                            "#/components/responses/Forbidden",
                    },

                    "404": {
                        $ref:
                            "#/components/responses/NotFound",
                    },
                },
            },

            delete: {
                tags: ["Branch Memberships"],
                summary: "Delete a branch membership",

                security: [
                    {
                        bearerAuth: [],
                    },
                ],

                parameters: [
                    {
                        $ref:
                            "#/components/parameters/MembershipId",
                    },
                ],

                responses: {
                    "200": {
                        description:
                            "Membership deleted successfully.",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref:
                                        "#/components/schemas/SuccessResponse",
                                },
                            },
                        },
                    },

                    "401": {
                        $ref:
                            "#/components/responses/Unauthorized",
                    },

                    "403": {
                        $ref:
                            "#/components/responses/Forbidden",
                    },

                    "404": {
                        $ref:
                            "#/components/responses/NotFound",
                    },
                },
            },
        },

        "/api/v1/branch-memberships": {
            post: {
                tags: ["Branch Memberships"],
                summary: "Create a branch membership",

                security: [
                    {
                        bearerAuth: [],
                    },
                ],

                description:
                    "Creates a user-to-branch membership. Administrative authorization is required.",

                requestBody: {
                    required: true,

                    content: {
                        "application/json": {
                            schema: {
                                $ref:
                                    "#/components/schemas/CreateBranchMembership",
                            },
                        },
                    },
                },

                responses: {
                    "201": {
                        description:
                            "Membership created successfully.",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref:
                                        "#/components/schemas/SuccessResponse",
                                },
                            },
                        },
                    },

                    "400": {
                        $ref:
                            "#/components/responses/BadRequest",
                    },

                    "401": {
                        $ref:
                            "#/components/responses/Unauthorized",
                    },

                    "403": {
                        $ref:
                            "#/components/responses/Forbidden",
                    },

                    "409": {
                        $ref:
                            "#/components/responses/Conflict",
                    },
                },
            },
        },
    },
};

export const swaggerSpec =
    swaggerJSDoc({
        definition: swaggerDefinition,
        apis: [],
    });