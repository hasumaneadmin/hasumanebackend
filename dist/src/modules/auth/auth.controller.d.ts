import type { Response } from "express";
import type { AuthenticatedRequest, AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { AuthService } from "./auth.service.js";
import { LoginDto } from "./dto/login.dto.js";
import { RequestPasswordResetDto, ResetPasswordDto } from "./dto/password-reset.dto.js";
import { RegisterDto, UpdateProfileDto } from "./dto/register.dto.js";
import { RefreshTokenDto, TokenDto } from "./dto/token.dto.js";
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(dto: RegisterDto, request: AuthenticatedRequest): Promise<{
        user: {};
        verificationToken: string;
    }>;
    login(dto: LoginDto, request: AuthenticatedRequest, res: Response): Promise<{
        accessToken: string;
        refreshToken: string;
        csrfToken: string;
        expiresIn: string;
        user: {};
    }>;
    refresh(dto: RefreshTokenDto, request: AuthenticatedRequest, res: Response): Promise<{
        accessToken: string;
        refreshToken: string;
        csrfToken: string;
        expiresIn: string;
    }>;
    profile(user: AuthenticatedUser): Promise<{
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
    updateProfile(user: AuthenticatedUser, dto: UpdateProfileDto, request: AuthenticatedRequest): Promise<{
        id: string;
        updatedAt: Date;
        name: string;
        email: string | null;
        role: string;
        phone: string;
        emailVerifiedAt: Date | null;
    }>;
    logout(user: AuthenticatedUser, request: AuthenticatedRequest, res: Response): Promise<{
        revoked: boolean;
    }>;
    forgotPassword(dto: RequestPasswordResetDto, request: AuthenticatedRequest): Promise<{
        queued: boolean;
        resetToken?: undefined;
    } | {
        queued: boolean;
        resetToken: string;
    }>;
    resetPasswordAlias(dto: ResetPasswordDto, request: AuthenticatedRequest): Promise<{
        reset: boolean;
    }>;
    resendVerification(user: AuthenticatedUser, request: AuthenticatedRequest): Promise<{
        queued: boolean;
        alreadyVerified: boolean;
        verificationToken?: undefined;
    } | {
        queued: boolean;
        verificationToken: string;
        alreadyVerified?: undefined;
    }>;
    requestPasswordReset(dto: RequestPasswordResetDto, request: AuthenticatedRequest): Promise<{
        queued: boolean;
        resetToken?: undefined;
    } | {
        queued: boolean;
        resetToken: string;
    }>;
    resetPassword(dto: ResetPasswordDto, request: AuthenticatedRequest): Promise<{
        reset: boolean;
    }>;
    verifyEmailAlias(dto: TokenDto, request: AuthenticatedRequest): Promise<{
        verified: boolean;
    }>;
    verifyEmail(dto: TokenDto, request: AuthenticatedRequest): Promise<{
        verified: boolean;
    }>;
    private setAuthCookies;
}
