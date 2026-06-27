var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service.js";
import { AuditLogService } from "../audit/audit-log.service.js";
let NotificationService = class NotificationService {
    prisma;
    auditLogService;
    constructor(prisma, auditLogService) {
        this.prisma = prisma;
        this.auditLogService = auditLogService;
    }
    async byStatus(status) {
        const notifications = await this.prisma.notification.findMany({
            where: { deletedAt: null, status },
            orderBy: { createdAt: "desc" },
            take: 300,
        });
        return { notifications };
    }
    async retry(id, actorId) {
        const existing = await this.prisma.notification.findFirst({
            where: { id, deletedAt: null },
        });
        if (!existing)
            throw new NotFoundException("Notification not found.");
        if (!["failed", "queued", "simulated"].includes(existing.status)) {
            throw new BadRequestException("Only failed or queued notifications can be retried.");
        }
        const retryCount = existing.metadata && typeof existing.metadata === "object" && !Array.isArray(existing.metadata)
            ? Number(existing.metadata.retryCount || 0) + 1
            : 1;
        const notification = await this.prisma.notification.update({
            where: { id },
            data: {
                status: process.env.WATI_API_KEY ? "queued" : "simulated",
                metadata: {
                    ...(existing.metadata && typeof existing.metadata === "object" && !Array.isArray(existing.metadata)
                        ? existing.metadata
                        : {}),
                    retryCount,
                    lastRetriedAt: new Date().toISOString(),
                },
            },
        });
        await this.auditLogService.record({
            userId: actorId,
            action: "retry",
            module: "notifications",
            entityType: "notification",
            entityId: notification.id,
            oldValue: existing,
            newValue: notification,
        });
        return { notification };
    }
};
NotificationService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService,
        AuditLogService])
], NotificationService);
export { NotificationService };
//# sourceMappingURL=notification.service.js.map