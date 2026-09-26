export type UserRole =
    | "USER"
    | "RIDER"
    | "ADMIN"
    | "SUPER_ADMIN";

export interface AuthenticatedUser {
    userId: string;
    role: UserRole;
}