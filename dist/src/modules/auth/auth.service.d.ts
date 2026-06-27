import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import type { AuthenticatedRequest } from "../../common/types/authenticated-request.js";
import { PrismaService } from "../../prisma/prisma.service.js";
import { AuditLogService } from "../audit/audit-log.service.js";
import type { LoginDto } from "./dto/login.dto.js";
import type { RegisterDto } from "./dto/register.dto.js";
type TokenPair = {
    accessToken: string;
    refreshToken: string;
    csrfToken: string;
    expiresIn: string;
};
export declare class AuthService {
    private readonly prisma;
    private readonly jwtService;
    private readonly configService;
    private readonly auditLogService;
    constructor(prisma: PrismaService, jwtService: JwtService, configService: ConfigService, auditLogService: AuditLogService);
    createSessionForUser(user: {
        id: string;
        email?: string | null;
        role: string;
    }, request: AuthenticatedRequest): Promise<TokenPair>;
    register(dto: RegisterDto, request: AuthenticatedRequest): Promise<{
        user: {};
        verificationToken: string;
    }>;
    login(dto: LoginDto, request: AuthenticatedRequest): Promise<{
        accessToken: string;
        refreshToken: string;
        csrfToken: string;
        expiresIn: string;
        user: {};
    }>;
    refresh(refreshToken: string | undefined, request: AuthenticatedRequest): Promise<TokenPair>;
    logout(sessionId: string | undefined, request: AuthenticatedRequest): Promise<{
        revoked: boolean;
    }>;
    profile(userId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        email: string | null;
        role: string;
        phone: string;
        emailVerifiedAt: Date | null;
        twoFactorEnabled: boolean;
        isBlocked: boolean;
        lastLoginAt: Date | null;
    }>;
    updateProfile(userId: string, dto: {
        name?: string;
        phone?: string;
    }, request: AuthenticatedRequest): Promise<{
        id: string;
        updatedAt: Date;
        name: string;
        email: string | null;
        role: string;
        phone: string;
        emailVerifiedAt: Date | null;
    }>;
    resendVerification(userId: string, request: AuthenticatedRequest): Promise<{
        queued: boolean;
        alreadyVerified: boolean;
        verificationToken?: undefined;
    } | {
        queued: boolean;
        verificationToken: string;
        alreadyVerified?: undefined;
    }>;
    requestPasswordReset(email: string, request: AuthenticatedRequest): Promise<{
        queued: boolean;
        resetToken?: undefined;
    } | {
        queued: boolean;
        resetToken: string;
    }>;
    resetPassword(token: string, password: string, request: AuthenticatedRequest): Promise<{
        reset: boolean;
    }>;
    verifyEmail(token: string, request: AuthenticatedRequest): Promise<{
        verified: boolean;
    }>;
    private issueTokenPair;
    private jwtTtl;
    private createEmailVerificationToken;
    private sanitizeUser;
    private get hashRounds();
    private randomToken;
    private sha256;
    private daysFromNow;
    private minutesFromNow;
    private writeAudit;
    private writeLogin;
}
export {};
