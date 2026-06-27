var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ConfigService } from "@nestjs/config";
import { createHash, timingSafeEqual } from "node:crypto";
import { IS_PUBLIC_KEY } from "../decorators/public.decorator.js";
import { PrismaService } from "../../prisma/prisma.service.js";
const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);
let CsrfGuard = class CsrfGuard {
    configService;
    reflector;
    prisma;
    constructor(configService, reflector, prisma) {
        this.configService = configService;
        this.reflector = reflector;
        this.prisma = prisma;
    }
    async canActivate(context) {
        const isPublic = this.reflector.getAllAndOverride(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (isPublic)
            return true;
        const request = context.switchToHttp().getRequest();
        if (SAFE_METHODS.has(request.method))
            return true;
        const headerName = this.configService.get("app.csrfHeader") || "x-csrf-token";
        const headerToken = request.header(headerName);
        const cookieToken = request.cookies?.csrf_token;
        if (!headerToken) {
            throw new ForbiddenException("Invalid CSRF token.");
        }
        if (cookieToken && this.safeEqual(headerToken, cookieToken)) {
            return true;
        }
        const sessionId = request.user?.sessionId;
        const userId = request.user?.id;
        if (!sessionId || !userId) {
            throw new ForbiddenException("Invalid CSRF token.");
        }
        const session = await this.prisma.userSession.findFirst({
            where: {
                id: sessionId,
                userId,
                revokedAt: null,
                deletedAt: null,
                expiresAt: { gt: new Date() },
            },
            select: { csrfTokenHash: true },
        });
        if (!session?.csrfTokenHash || !this.safeEqual(this.sha256(headerToken), session.csrfTokenHash)) {
            throw new ForbiddenException("Invalid CSRF token.");
        }
        return true;
    }
    sha256(value) {
        return createHash("sha256").update(value).digest("hex");
    }
    safeEqual(left, right) {
        const leftBuffer = Buffer.from(left);
        const rightBuffer = Buffer.from(right);
        return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
    }
};
CsrfGuard = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [ConfigService,
        Reflector,
        PrismaService])
], CsrfGuard);
export { CsrfGuard };
//# sourceMappingURL=csrf.guard.js.map