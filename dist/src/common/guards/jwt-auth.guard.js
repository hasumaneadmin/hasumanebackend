var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { IS_PUBLIC_KEY } from "../decorators/public.decorator.js";
let JwtAuthGuard = class JwtAuthGuard {
    reflector;
    jwtService;
    configService;
    constructor(reflector, jwtService, configService) {
        this.reflector = reflector;
        this.jwtService = jwtService;
        this.configService = configService;
    }
    async canActivate(context) {
        const isPublic = this.reflector.getAllAndOverride(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (isPublic)
            return true;
        const request = context.switchToHttp().getRequest();
        const token = this.extractToken(request);
        if (!token) {
            throw new UnauthorizedException("Missing access token.");
        }
        try {
            const payload = await this.jwtService.verifyAsync(token, {
                secret: this.configService.getOrThrow("app.jwt.accessSecret"),
            });
            if (payload.type !== "access") {
                throw new UnauthorizedException("Invalid token type.");
            }
            request.user = {
                id: payload.sub,
                email: payload.email,
                role: payload.role,
                sessionId: payload.sessionId,
            };
            return true;
        }
        catch {
            throw new UnauthorizedException("Invalid or expired access token.");
        }
    }
    extractToken(request) {
        const authHeader = request.header("authorization");
        if (authHeader?.startsWith("Bearer ")) {
            return authHeader.slice(7);
        }
        return request.cookies?.access_token;
    }
};
JwtAuthGuard = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [Reflector,
        JwtService,
        ConfigService])
], JwtAuthGuard);
export { JwtAuthGuard };
//# sourceMappingURL=jwt-auth.guard.js.map