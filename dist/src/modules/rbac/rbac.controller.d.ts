import type { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { UpsertPermissionDto } from "./dto/upsert-permission.dto.js";
import { RbacService } from "./rbac.service.js";
export declare class RbacController {
    private readonly rbacService;
    constructor(rbacService: RbacService);
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
    upsertPermission(dto: UpsertPermissionDto, user: AuthenticatedUser): Promise<{
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
    auditLogs(limit?: string): import(".prisma/client").Prisma.PrismaPromise<{
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
