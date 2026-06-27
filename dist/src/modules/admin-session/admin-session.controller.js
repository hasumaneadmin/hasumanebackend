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
import { Body, Controller, Delete, Get, HttpCode, Post, Req, Res } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../../common/decorators/current-user.decorator.js";
import { Public } from "../../common/decorators/public.decorator.js";
import { AuthService } from "../auth/auth.service.js";
import { AdminSessionService } from "./admin-session.service.js";
import { CreateAdminSessionDto } from "./dto/admin-session.dto.js";
let AdminSessionController = class AdminSessionController {
    adminSessionService;
    authService;
    constructor(adminSessionService, authService) {
        this.adminSessionService = adminSessionService;
        this.authService = authService;
    }
    async create(dto, request, res) {
        const { session, tokens } = await this.adminSessionService.create(dto.password, request);
        this.setAuthCookies(res, tokens);
        return session;
    }
    verify(user) {
        return {
            authenticated: true,
            role: this.adminSessionService.toClientRole(user.role),
        };
    }
    async destroy(user, request, res) {
        res.clearCookie("access_token");
        res.clearCookie("refresh_token");
        res.clearCookie("csrf_token");
        await this.authService.logout(user.sessionId, request);
        return { authenticated: false };
    }
    setAuthCookies(res, tokens) {
        const secure = process.env.NODE_ENV === "production";
        const cookieOptions = {
            secure,
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        };
        res.cookie("access_token", tokens.accessToken, {
            ...cookieOptions,
            httpOnly: true,
            maxAge: 15 * 60 * 1000,
        });
        res.cookie("refresh_token", tokens.refreshToken, {
            ...cookieOptions,
            httpOnly: true,
        });
        res.cookie("csrf_token", tokens.csrfToken, {
            ...cookieOptions,
            httpOnly: false,
        });
    }
};
__decorate([
    Public(),
    Post(),
    HttpCode(200),
    ApiOperation({ summary: "Create an admin console JWT session from the admin token." }),
    __param(0, Body()),
    __param(1, Req()),
    __param(2, Res({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CreateAdminSessionDto, Object, Object]),
    __metadata("design:returntype", Promise)
], AdminSessionController.prototype, "create", null);
__decorate([
    ApiBearerAuth(),
    Get(),
    ApiOperation({ summary: "Verify the active admin console session." }),
    __param(0, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AdminSessionController.prototype, "verify", null);
__decorate([
    ApiBearerAuth(),
    Delete(),
    HttpCode(200),
    ApiOperation({ summary: "Destroy the active admin console session." }),
    __param(0, CurrentUser()),
    __param(1, Req()),
    __param(2, Res({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], AdminSessionController.prototype, "destroy", null);
AdminSessionController = __decorate([
    ApiTags("Admin Session"),
    Controller({ path: "admin/session", version: "1" }),
    __metadata("design:paramtypes", [AdminSessionService,
        AuthService])
], AdminSessionController);
export { AdminSessionController };
//# sourceMappingURL=admin-session.controller.js.map