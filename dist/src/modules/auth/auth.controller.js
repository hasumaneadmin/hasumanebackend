var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { Body, Controller, Get, HttpCode, Post, Put, Req, Res } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../../common/decorators/current-user.decorator.js";
import { Public } from "../../common/decorators/public.decorator.js";
import { AuthService } from "./auth.service.js";
import { LoginDto } from "./dto/login.dto.js";
import { RequestPasswordResetDto, ResetPasswordDto } from "./dto/password-reset.dto.js";
import { RegisterDto, UpdateProfileDto } from "./dto/register.dto.js";
import { RefreshTokenDto, TokenDto } from "./dto/token.dto.js";
let AuthController = class AuthController {
    authService;
    constructor(authService) {
        this.authService = authService;
    }
    register(dto, request) {
        return this.authService.register(dto, request);
    }
    async login(dto, request, res) {
        const result = await this.authService.login(dto, request);
        this.setAuthCookies(res, result);
        return result;
    }
    async refresh(dto, request, res) {
        const refreshToken = dto.refreshToken || request.cookies?.refresh_token;
        const result = await this.authService.refresh(refreshToken, request);
        this.setAuthCookies(res, result);
        return result;
    }
    profile(user) {
        return this.authService.profile(user.id);
    }
    updateProfile(user, dto, request) {
        return this.authService.updateProfile(user.id, dto, request);
    }
    async logout(user, request, res) {
        res.clearCookie("access_token");
        res.clearCookie("refresh_token");
        res.clearCookie("csrf_token");
        return this.authService.logout(user?.sessionId, request);
    }
    forgotPassword(dto, request) {
        return this.authService.requestPasswordReset(dto.email, request);
    }
    resetPasswordAlias(dto, request) {
        return this.authService.resetPassword(dto.token, dto.password, request);
    }
    resendVerification(user, request) {
        return this.authService.resendVerification(user.id, request);
    }
    requestPasswordReset(dto, request) {
        return this.authService.requestPasswordReset(dto.email, request);
    }
    resetPassword(dto, request) {
        return this.authService.resetPassword(dto.token, dto.password, request);
    }
    verifyEmailAlias(dto, request) {
        return this.authService.verifyEmail(dto.token, request);
    }
    verifyEmail(dto, request) {
        return this.authService.verifyEmail(dto.token, request);
    }
    setAuthCookies(res, tokens) {
        const secure = process.env.NODE_ENV === "production";
        res.cookie("access_token", tokens.accessToken, {
            httpOnly: true,
            secure,
            sameSite: "lax",
            maxAge: 15 * 60 * 1000,
        });
        res.cookie("refresh_token", tokens.refreshToken, {
            httpOnly: true,
            secure,
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        res.cookie("csrf_token", tokens.csrfToken, {
            httpOnly: false,
            secure,
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
    }
};
__decorate([
    Public(),
    Post("register"),
    ApiOperation({ summary: "Register a customer or admin user." }),
    __param(0, Body()),
    __param(1, Req()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [RegisterDto, Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "register", null);
__decorate([
    Public(),
    Post("login"),
    HttpCode(200),
    ApiOperation({ summary: "Authenticate and issue JWT access and refresh tokens." }),
    __param(0, Body()),
    __param(1, Req()),
    __param(2, Res({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [LoginDto, Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    Public(),
    Post("refresh"),
    HttpCode(200),
    ApiOperation({ summary: "Rotate refresh token and issue a new token pair." }),
    __param(0, Body()),
    __param(1, Req()),
    __param(2, Res({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [RefreshTokenDto, Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "refresh", null);
__decorate([
    ApiBearerAuth(),
    Get("profile"),
    ApiOperation({ summary: "Get the authenticated profile." }),
    __param(0, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "profile", null);
__decorate([
    ApiBearerAuth(),
    Put("profile"),
    ApiOperation({ summary: "Update the authenticated profile." }),
    __param(0, CurrentUser()),
    __param(1, Body()),
    __param(2, Req()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, UpdateProfileDto, Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "updateProfile", null);
__decorate([
    ApiBearerAuth(),
    Post("logout"),
    HttpCode(200),
    ApiOperation({ summary: "Revoke the active session." }),
    __param(0, CurrentUser()),
    __param(1, Req()),
    __param(2, Res({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "logout", null);
__decorate([
    Public(),
    Post("forgot-password"),
    HttpCode(202),
    __param(0, Body()),
    __param(1, Req()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [RequestPasswordResetDto, Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "forgotPassword", null);
__decorate([
    Public(),
    Post("reset-password"),
    HttpCode(200),
    __param(0, Body()),
    __param(1, Req()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ResetPasswordDto, Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "resetPasswordAlias", null);
__decorate([
    ApiBearerAuth(),
    Post("resend-verification"),
    HttpCode(202),
    __param(0, CurrentUser()),
    __param(1, Req()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "resendVerification", null);
__decorate([
    Public(),
    Post("password-reset/request"),
    HttpCode(202),
    __param(0, Body()),
    __param(1, Req()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [RequestPasswordResetDto, Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "requestPasswordReset", null);
__decorate([
    Public(),
    Post("password-reset/confirm"),
    HttpCode(200),
    __param(0, Body()),
    __param(1, Req()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ResetPasswordDto, Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "resetPassword", null);
__decorate([
    Public(),
    Post("verify-email"),
    HttpCode(200),
    __param(0, Body()),
    __param(1, Req()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [TokenDto, Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "verifyEmailAlias", null);
__decorate([
    Public(),
    Post("email/verify"),
    HttpCode(200),
    __param(0, Body()),
    __param(1, Req()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [TokenDto, Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "verifyEmail", null);
AuthController = __decorate([
    ApiTags("Auth"),
    Controller({ path: "auth", version: "1" }),
    __metadata("design:paramtypes", [AuthService])
], AuthController);
export { AuthController };
//# sourceMappingURL=auth.controller.js.map