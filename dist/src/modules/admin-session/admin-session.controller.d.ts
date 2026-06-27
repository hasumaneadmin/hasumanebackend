import type { Response } from "express";
import type { AuthenticatedRequest, AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { AuthService } from "../auth/auth.service.js";
import { AdminSessionService } from "./admin-session.service.js";
import { CreateAdminSessionDto } from "./dto/admin-session.dto.js";
export declare class AdminSessionController {
    private readonly adminSessionService;
    private readonly authService;
    constructor(adminSessionService: AdminSessionService, authService: AuthService);
    create(dto: CreateAdminSessionDto, request: AuthenticatedRequest, res: Response): Promise<{
        authenticated: boolean;
        accessToken: string;
        csrfToken: string;
        expiresAt: string;
        role: string;
    }>;
    verify(user: AuthenticatedUser): {
        authenticated: boolean;
        role: string;
    };
    destroy(user: AuthenticatedUser, request: AuthenticatedRequest, res: Response): Promise<{
        authenticated: boolean;
    }>;
    private setAuthCookies;
}
