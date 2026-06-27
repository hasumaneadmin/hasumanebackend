import type { AuthenticatedRequest } from "../../common/types/authenticated-request.js";
import { PrismaService } from "../../prisma/prisma.service.js";
import { AuthService } from "../auth/auth.service.js";
export declare class AdminSessionService {
    private readonly authService;
    private readonly prisma;
    constructor(authService: AuthService, prisma: PrismaService);
    create(password: string, request: AuthenticatedRequest): Promise<{
        session: {
            authenticated: boolean;
            accessToken: string;
            csrfToken: string;
            expiresAt: string;
            role: string;
        };
        tokens: {
            accessToken: string;
            refreshToken: string;
            csrfToken: string;
            expiresIn: string;
        };
    }>;
    toClientRole(role: string): string;
    private ensureAdminUser;
    private writeLogin;
}
