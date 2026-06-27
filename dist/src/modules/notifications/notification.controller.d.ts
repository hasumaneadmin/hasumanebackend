import type { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { NotificationService } from "./notification.service.js";
export declare class NotificationController {
    private readonly notificationService;
    constructor(notificationService: NotificationService);
    pending(): Promise<{
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
    sent(): Promise<{
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
    failed(): Promise<{
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
    retry(id: string, user: AuthenticatedUser): Promise<{
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
