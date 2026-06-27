import { Prisma } from "@prisma/client";
import type { AuthenticatedRequest } from "../../common/types/authenticated-request.js";
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
export declare class AuditLogService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    record(input: AuditEventInput): Promise<{
        id: string;
        userId: string | null;
        ipAddress: string | null;
        userAgent: string | null;
        createdAt: Date;
        module: string;
        metadata: Prisma.JsonValue | null;
        action: string;
        entityType: string | null;
        actorId: string | null;
        entityId: string | null;
        oldValue: Prisma.JsonValue | null;
        newValue: Prisma.JsonValue | null;
    }>;
    list(query: AuditLogQueryDto): Promise<{
        data: {
            id: string;
            userId: string | null;
            ipAddress: string | null;
            userAgent: string | null;
            createdAt: Date;
            module: string;
            metadata: Prisma.JsonValue | null;
            action: string;
            entityType: string | null;
            actorId: string | null;
            entityId: string | null;
            oldValue: Prisma.JsonValue | null;
            newValue: Prisma.JsonValue | null;
        }[];
        meta: import("../../common/utils/pagination.js").PaginationMeta;
    }>;
    dashboard(query: AuditLogQueryDto): Promise<{
        recentActivities: {
            id: string;
            userId: string | null;
            ipAddress: string | null;
            userAgent: string | null;
            createdAt: Date;
            module: string;
            metadata: Prisma.JsonValue | null;
            action: string;
            entityType: string | null;
            actorId: string | null;
            entityId: string | null;
            oldValue: Prisma.JsonValue | null;
            newValue: Prisma.JsonValue | null;
        }[];
        userActivitySummary: {
            userId: string;
            eventCount: number;
        }[];
        securityEvents: {
            id: string;
            userId: string | null;
            ipAddress: string | null;
            userAgent: string | null;
            createdAt: Date;
            module: string;
            metadata: Prisma.JsonValue | null;
            action: string;
            entityType: string | null;
            actorId: string | null;
            entityId: string | null;
            oldValue: Prisma.JsonValue | null;
            newValue: Prisma.JsonValue | null;
        }[];
    }>;
    private buildWhere;
    private jsonInput;
}
