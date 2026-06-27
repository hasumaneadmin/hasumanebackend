import { PrismaService } from "../../prisma/prisma.service.js";
import { AuditLogService } from "../audit/audit-log.service.js";
import type { UpsertPermissionDto } from "./dto/upsert-permission.dto.js";
export declare class RbacService {
    private readonly prisma;
    private readonly auditLogService;
    constructor(prisma: PrismaService, auditLogService: AuditLogService);
    listPermissions(): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        role: string;
        module: string;
        canView: boolean;
        canCreate: boolean;
        canEdit: boolean;
        canDelete: boolean;
        canExport: boolean;
    }[]>;
    upsertPermission(dto: UpsertPermissionDto, actorId?: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        role: string;
        module: string;
        canView: boolean;
        canCreate: boolean;
        canEdit: boolean;
        canDelete: boolean;
        canExport: boolean;
    }>;
    auditLogs(limit?: number): import(".prisma/client").Prisma.PrismaPromise<{
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
    }[]>;
}
