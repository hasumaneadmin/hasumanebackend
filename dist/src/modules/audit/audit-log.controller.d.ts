import { AuditLogService } from "./audit-log.service.js";
import { AuditLogQueryDto } from "./dto/audit-log-query.dto.js";
export declare class AuditLogController {
    private readonly auditLogService;
    constructor(auditLogService: AuditLogService);
    list(query: AuditLogQueryDto): Promise<{
        data: {
            id: string;
            userId: string | null;
            ipAddress: string | null;
            userAgent: string | null;
            createdAt: Date;
            module: string;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            action: string;
            entityType: string | null;
            actorId: string | null;
            entityId: string | null;
            oldValue: import("@prisma/client/runtime/library").JsonValue | null;
            newValue: import("@prisma/client/runtime/library").JsonValue | null;
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
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            action: string;
            entityType: string | null;
            actorId: string | null;
            entityId: string | null;
            oldValue: import("@prisma/client/runtime/library").JsonValue | null;
            newValue: import("@prisma/client/runtime/library").JsonValue | null;
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
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            action: string;
            entityType: string | null;
            actorId: string | null;
            entityId: string | null;
            oldValue: import("@prisma/client/runtime/library").JsonValue | null;
            newValue: import("@prisma/client/runtime/library").JsonValue | null;
        }[];
    }>;
}
