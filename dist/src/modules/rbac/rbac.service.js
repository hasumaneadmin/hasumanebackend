var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service.js";
import { AuditLogService } from "../audit/audit-log.service.js";
let RbacService = class RbacService {
    prisma;
    auditLogService;
    constructor(prisma, auditLogService) {
        this.prisma = prisma;
        this.auditLogService = auditLogService;
    }
    listPermissions() {
        return this.prisma.rolePermission.findMany({
            orderBy: [{ role: "asc" }, { module: "asc" }],
        });
    }
    async upsertPermission(dto, actorId) {
        const existing = await this.prisma.rolePermission.findUnique({
            where: {
                role_module: {
                    role: dto.role,
                    module: dto.module,
                },
            },
        });
        const permission = await this.prisma.rolePermission.upsert({
            where: {
                role_module: {
                    role: dto.role,
                    module: dto.module,
                },
            },
            update: dto,
            create: dto,
        });
        await this.auditLogService.record({
            userId: actorId,
            action: "permission_change",
            module: "rbac",
            entityType: "role_permission",
            entityId: permission.id,
            oldValue: existing,
            newValue: permission,
        });
        return permission;
    }
    auditLogs(limit = 100) {
        return this.prisma.auditLog.findMany({
            take: Math.min(limit, 500),
            orderBy: { createdAt: "desc" },
        });
    }
};
RbacService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService,
        AuditLogService])
], RbacService);
export { RbacService };
//# sourceMappingURL=rbac.service.js.map