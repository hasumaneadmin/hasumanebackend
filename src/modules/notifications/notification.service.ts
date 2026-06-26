import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service.js";
import { AuditLogService } from "../audit/audit-log.service.js";

@Injectable()
export class NotificationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogService: AuditLogService,
  ) {}

  async byStatus(status: "queued" | "sent" | "failed" | "simulated") {
    const notifications = await this.prisma.notification.findMany({
      where: { deletedAt: null, status },
      orderBy: { createdAt: "desc" },
      take: 300,
    });
    return { notifications };
  }

  async retry(id: string, actorId?: string) {
    const existing = await this.prisma.notification.findFirst({
      where: { id, deletedAt: null },
    });
    if (!existing) throw new NotFoundException("Notification not found.");
    if (!["failed", "queued", "simulated"].includes(existing.status)) {
      throw new BadRequestException("Only failed or queued notifications can be retried.");
    }

    const retryCount =
      existing.metadata && typeof existing.metadata === "object" && !Array.isArray(existing.metadata)
        ? Number((existing.metadata as Record<string, unknown>).retryCount || 0) + 1
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
}
