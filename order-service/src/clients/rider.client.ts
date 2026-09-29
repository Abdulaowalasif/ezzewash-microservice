import { env } from "../config/config.js";

interface RiderResponse<T> {
    data: T;
}

export interface CreateRiderAssignmentRequest {
    riderId: string;
    orderId: string;
}

export interface RiderAssignment {
    id: string;
    riderId: string;
    orderId: string;
    status: string;
    earning: number;
}

export class RiderClient {
    private readonly baseUrl =
        env.riderServiceUrl;

    async createAssignment(
        request: CreateRiderAssignmentRequest,
        authorization: string
    ): Promise<RiderAssignment> {
        const response =
            await fetch(
                `${this.baseUrl}/api/v1/rider-assignments`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json",
                        Authorization:
                            authorization,
                    },
                    body: JSON.stringify(request),
                }
            );

        if (!response.ok) {
            throw new Error(
                `Rider service request failed with status ${response.status}`
            );
        }

        const body =
            (await response.json()) as
            | RiderAssignment
            | RiderResponse<RiderAssignment>;

        if (
            "data" in body &&
            body.data
        ) {
            return body.data;
        }

        return body as RiderAssignment;
    }
}

export const riderClient =
    new RiderClient();