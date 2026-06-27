import { PrismaService } from "../../prisma/prisma.service.js";
import { AuditLogService } from "../audit/audit-log.service.js";
export declare class NotificationService {
    private readonly prisma;
    private readonly auditLogService;
    constructor(prisma: PrismaService, auditLogService: AuditLogService);
    byStatus(status: "queued" | "sent" | "failed" | "simulated"): Promise<{
        notifications: {
            type: string;
            id: string;
            userId: string | null;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            title: string | null;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            status: string;
            channel: string;
            body: string;
            sentAt: Date | null;
        }[];
    }>;
    retry(id: string, actorId?: string): Promise<{
        notification: {
            type: string;
            id: string;
            userId: string | null;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            title: string | null;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            status: string;
            channel: string;
            body: string;
            sentAt: Date | null;
        };
    }>;
}
