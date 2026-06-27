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
import { Role } from "../../common/constants/roles.js";
import { PrismaService } from "../../prisma/prisma.service.js";
import { AuthService } from "../auth/auth.service.js";
let AdminSessionService = class AdminSessionService {
    authService;
    prisma;
    constructor(authService, prisma) {
        this.authService = authService;
        this.prisma = prisma;
    }
    async create(password, request) {
        const expectedToken = process.env.ADMIN_API_TOKEN || "sujan";
        if (!password || password !== expectedToken) {
            await this.writeLogin(null, "failed", request);
            throw new UnauthorizedException("Invalid admin token.");
        }
        const user = await this.ensureAdminUser();
        await this.writeLogin(user.id, "success", request, user.role);
        const tokens = await this.authService.createSessionForUser(user, request);
        return {
            session: {
                authenticated: true,
                accessToken: tokens.accessToken,
                csrfToken: tokens.csrfToken,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                role: this.toClientRole(user.role),
            },
            tokens,
        };
    }
    toClientRole(role) {
        const map = {
            [Role.SUPER_ADMIN]: "super_admin",
            [Role.ADMIN]: "admin",
            [Role.MANAGER]: "manager",
            [Role.SUPPORT]: "customer_support",
            [Role.DELIVERY_PARTNER]: "rider",
            [Role.CUSTOMER]: "consumer",
        };
        return map[role] || role.toLowerCase();
    }
    async ensureAdminUser() {
        const email = process.env.ADMIN_EMAIL || "admin@hasumane.local";
        const phone = process.env.ADMIN_PHONE || "+910000000000";
        const existing = await this.prisma.user.findFirst({
            where: { OR: [{ email }, { phone }] },
        });
        if (existing) {
            return this.prisma.user.update({
                where: { id: existing.id },
                data: {
                    email,
                    phone,
                    role: Role.SUPER_ADMIN,
                    isBlocked: false,
                    updatedBy: existing.id,
                },
            });
        }
        return this.prisma.user.create({
            data: {
                name: "HasuMane Admin",
                email,
                phone,
                role: Role.SUPER_ADMIN,
            },
        });
    }
    async writeLogin(userId, status, request, role) {
        await this.prisma.loginHistory.create({
            data: {
                userId,
                role,
                status,
                ipAddress: request.context?.ipAddress,
                userAgent: request.context?.userAgent,
            },
        });
    }
};
AdminSessionService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [AuthService,
        PrismaService])
], AdminSessionService);
export { AdminSessionService };
//# sourceMappingURL=admin-session.service.js.map