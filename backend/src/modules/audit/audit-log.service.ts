import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import type { AuthenticatedRequest } from "../../common/types/authenticated-request.js";
import { buildPaginationMeta, getPagination } from "../../common/utils/pagination.js";
import { PrismaService } from "../../prisma/prisma.service.js";
import type { AuditLogQueryDto } from "./dto/audit-log-query.dto.js";

export type AuditEventInput = {
  userId?: string;
  action: string;
  module: string;
  entityType?: string;
  entityId?: string;
  oldValue?: unknown;
  newValue?: unknown;
  metadata?: unknown;
  request?: AuthenticatedRequest;
};

@Injectable()
export class AuditLogService {
  constructor(private readonly prisma: PrismaService) {}

  async record(input: AuditEventInput) {
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

  async list(query: AuditLogQueryDto) {
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

  async dashboard(query: AuditLogQueryDto) {
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

  private buildWhere(query: AuditLogQueryDto): Prisma.AuditLogWhereInput {
    const and: Prisma.AuditLogWhereInput[] = [];
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

    const where: Prisma.AuditLogWhereInput = {
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

  private jsonInput(value: unknown) {
    if (value === undefined) return undefined;
    return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
  }
}
