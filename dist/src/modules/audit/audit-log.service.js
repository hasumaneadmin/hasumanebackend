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
import { buildPaginationMeta, getPagination } from "../../common/utils/pagination.js";
import { PrismaService } from "../../prisma/prisma.service.js";
let AuditLogService = class AuditLogService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async record(input) {
        const userId = input.userId || input.request?.user?.id;
        return this.prisma.auditLog.create({
            data: {
                userId,
                actorId: userId,
                action: input.action,
                module: input.module,
                entityType: input.entityType,
                entityId: input.entityId,
                oldValue: this.jsonInput(input.oldValue),
                newValue: this.jsonInput(input.newValue),
                metadata: this.jsonInput(input.metadata),
                ipAddress: input.request?.context?.ipAddress,
                userAgent: input.request?.context?.userAgent,
            },
        });
    }
    async list(query) {
        const { page, limit, skip, take } = getPagination(query);
        const where = this.buildWhere(query);
        const [auditLogs, total] = await this.prisma.$transaction([
            this.prisma.auditLog.findMany({
                where,
                skip,
                take,
                orderBy: { createdAt: "desc" },
            }),
            this.prisma.auditLog.count({ where }),
        ]);
        return {
            data: auditLogs,
            meta: buildPaginationMeta(page, limit, total),
        };
    }
    async dashboard(query) {
        const where = this.buildWhere(query);
        const [recentActivities, userActivity, securityEvents] = await Promise.all([
            this.prisma.auditLog.findMany({
                where,
                orderBy: { createdAt: "desc" },
                take: 25,
            }),
            this.prisma.auditLog.groupBy({
                by: ["userId"],
                where,
                _count: { _all: true },
                orderBy: { _count: { userId: "desc" } },
                take: 20,
            }),
            this.prisma.auditLog.findMany({
                where: {
                    ...where,
                    OR: [
                        { module: "auth" },
                        { module: "security" },
                        { action: { contains: "permission", mode: "insensitive" } },
                        { action: { contains: "role", mode: "insensitive" } },
                    ],
                },
                orderBy: { createdAt: "desc" },
                take: 25,
            }),
        ]);
        return {
            recentActivities,
            userActivitySummary: userActivity.map((activity) => ({
                userId: activity.userId || "system",
                eventCount: activity._count._all,
            })),
            securityEvents,
        };
    }
    buildWhere(query) {
        const and = [];
        if (query.userId) {
            and.push({ OR: [{ userId: query.userId }, { actorId: query.userId }] });
        }
        if (query.search) {
            and.push({
                OR: [
                    { action: { contains: query.search, mode: "insensitive" } },
                    { module: { contains: query.search, mode: "insensitive" } },
                    { entityType: { contains: query.search, mode: "insensitive" } },
                    { entityId: { contains: query.search, mode: "insensitive" } },
                ],
            });
        }
        const where = {
            ...(query.action ? { action: query.action } : {}),
            ...(query.entityType ? { entityType: query.entityType } : {}),
            ...(query.module ? { module: query.module } : {}),
            ...(query.from || query.to
                ? {
                    createdAt: {
                        ...(query.from ? { gte: new Date(query.from) } : {}),
                        ...(query.to ? { lte: new Date(query.to) } : {}),
                    },
                }
                : {}),
        };
        return and.length ? { ...where, AND: and } : where;
    }
    jsonInput(value) {
        if (value === undefined)
            return undefined;
        return JSON.parse(JSON.stringify(value));
    }
};
AuditLogService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService])
], AuditLogService);
export { AuditLogService };
//# sourceMappingURL=audit-log.service.js.map