import type { AuthenticatedRequest, AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { OperationsService } from "./operations.service.js";
type Payload = Record<string, unknown>;
export declare class LeadsController {
    private readonly operationsService;
    constructor(operationsService: OperationsService);
    capture(payload: Payload, request: AuthenticatedRequest): Promise<{
        id: string;
        submittedAt: string;
    }>;
}
export declare class AdminSummaryController {
    private readonly operationsService;
    constructor(operationsService: OperationsService);
    summary(): Promise<{
        summary: {
            users: {
                total: number;
                byRole: Record<string, number>;
            };
            subscriptions: {
                total: number;
                byStatus: Record<string, number>;
            };
            orders: {
                total: number;
                byStatus: Record<string, number>;
            };
            procurement: {
                totalLogs: number;
                totalVolumeLiters: number;
                totalPayoutAmount: number;
            };
            notifications: {
                total: number;
                latest: {
                    id: string;
                    type: string;
                    channel: string;
                    phone: string;
                    details: {
                        [x: string]: unknown;
                    };
                    body: string;
                    status: string;
                    createdAt: string;
                }[];
            };
            dashboard: {
                totalOrders: number;
                totalRevenue: number;
                todaySales: number;
                pendingOrders: number;
                deliveredOrders: number;
                activeUsers: number;
                activeProducts: number;
                openSupportTickets: number;
            };
            leads: {
                total: number;
                latest: {
                    id: string;
                    userId: string;
                    subscriptionId: string;
                    name: string;
                    phone: string;
                    area: string;
                    productType: string;
                    quantity: number;
                    scheduleType: string;
                    notes: string;
                    source: string;
                    status: string;
                    submittedAt: string;
                }[];
                bySource: Record<string, number>;
            };
        };
    }>;
    leads(): Promise<{
        leads: {
            id: string;
            userId: string;
            subscriptionId: string;
            name: string;
            phone: string;
            area: string;
            productType: string;
            quantity: number;
            scheduleType: string;
            notes: string;
            source: string;
            status: string;
            submittedAt: string;
        }[];
    }>;
    removeLead(id: string, user: AuthenticatedUser): Promise<{
        lead: {
            id: string;
            userId: string | null;
            userAgent: string | null;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            phone: string;
            status: string;
            productType: string;
            quantity: number;
            notes: string | null;
            scheduleType: string;
            subscriptionId: string | null;
            area: string;
            source: string | null;
            referrer: string | null;
            submittedAt: Date;
        };
        deletedSubscriptionId: string | null;
    } | {
        lead: {
            id: string;
            userId: string | null;
            userAgent: string | null;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            phone: string;
            status: string;
            productType: string;
            quantity: number;
            notes: string | null;
            scheduleType: string;
            subscriptionId: string | null;
            area: string;
            source: string | null;
            referrer: string | null;
            submittedAt: Date;
        };
        deletedSubscriptionId?: undefined;
    }>;
}
export declare class SubscriptionsController {
    private readonly operationsService;
    constructor(operationsService: OperationsService);
    capturePublic(payload: Payload, request: AuthenticatedRequest): Promise<{
        id: string;
        submittedAt: string;
    }>;
    list(): Promise<{
        subscriptions: {
            user: {
                role: string;
            } | undefined;
            dailyOrders: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                createdBy: string | null;
                updatedBy: string | null;
                status: string;
                quantity: number;
                proofPhotoUrl: string | null;
                subscriptionId: string;
                deliveryDate: Date;
                riderId: string | null;
                deliveredAt: Date | null;
            }[];
            id: string;
            userId: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            createdBy: string | null;
            updatedBy: string | null;
            status: string;
            productType: string;
            quantity: number;
            scheduleType: string;
            customDays: import("@prisma/client/runtime/library").JsonValue | null;
            startDate: Date;
            pauseUntil: Date | null;
        }[];
    }>;
    create(payload: Payload, user: AuthenticatedUser): Promise<{
        subscription: {
            user: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                createdBy: string | null;
                updatedBy: string | null;
                name: string;
                email: string | null;
                role: string;
                phone: string;
                passwordHash: string | null;
                emailVerifiedAt: Date | null;
                twoFactorEnabled: boolean;
                twoFactorSecret: string | null;
                isBlocked: boolean;
                lastLoginAt: Date | null;
            };
            dailyOrders: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                createdBy: string | null;
                updatedBy: string | null;
                status: string;
                quantity: number;
                proofPhotoUrl: string | null;
                subscriptionId: string;
                deliveryDate: Date;
                riderId: string | null;
                deliveredAt: Date | null;
            }[];
        } & {
            id: string;
            userId: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            createdBy: string | null;
            updatedBy: string | null;
            status: string;
            productType: string;
            quantity: number;
            scheduleType: string;
            customDays: import("@prisma/client/runtime/library").JsonValue | null;
            startDate: Date;
            pauseUntil: Date | null;
        };
    }>;
    updateStatus(id: string, payload: Payload, user: AuthenticatedUser): Promise<{
        subscription: {
            user: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                createdBy: string | null;
                updatedBy: string | null;
                name: string;
                email: string | null;
                role: string;
                phone: string;
                passwordHash: string | null;
                emailVerifiedAt: Date | null;
                twoFactorEnabled: boolean;
                twoFactorSecret: string | null;
                isBlocked: boolean;
                lastLoginAt: Date | null;
            };
            dailyOrders: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                createdBy: string | null;
                updatedBy: string | null;
                status: string;
                quantity: number;
                proofPhotoUrl: string | null;
                subscriptionId: string;
                deliveryDate: Date;
                riderId: string | null;
                deliveredAt: Date | null;
            }[];
        } & {
            id: string;
            userId: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            createdBy: string | null;
            updatedBy: string | null;
            status: string;
            productType: string;
            quantity: number;
            scheduleType: string;
            customDays: import("@prisma/client/runtime/library").JsonValue | null;
            startDate: Date;
            pauseUntil: Date | null;
        };
    }>;
    pause(id: string, payload: Payload, user: AuthenticatedUser): Promise<{
        subscription: {
            id: string;
            userId: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            createdBy: string | null;
            updatedBy: string | null;
            status: string;
            productType: string;
            quantity: number;
            scheduleType: string;
            customDays: import("@prisma/client/runtime/library").JsonValue | null;
            startDate: Date;
            pauseUntil: Date | null;
        };
    }>;
    resume(id: string, user: AuthenticatedUser): Promise<{
        subscription: {
            id: string;
            userId: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            createdBy: string | null;
            updatedBy: string | null;
            status: string;
            productType: string;
            quantity: number;
            scheduleType: string;
            customDays: import("@prisma/client/runtime/library").JsonValue | null;
            startDate: Date;
            pauseUntil: Date | null;
        };
    }>;
    remove(id: string, user: AuthenticatedUser): Promise<{
        subscription: {
            user: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                createdBy: string | null;
                updatedBy: string | null;
                name: string;
                email: string | null;
                role: string;
                phone: string;
                passwordHash: string | null;
                emailVerifiedAt: Date | null;
                twoFactorEnabled: boolean;
                twoFactorSecret: string | null;
                isBlocked: boolean;
                lastLoginAt: Date | null;
            };
            dailyOrders: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                createdBy: string | null;
                updatedBy: string | null;
                status: string;
                quantity: number;
                proofPhotoUrl: string | null;
                subscriptionId: string;
                deliveryDate: Date;
                riderId: string | null;
                deliveredAt: Date | null;
            }[];
        } & {
            id: string;
            userId: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            createdBy: string | null;
            updatedBy: string | null;
            status: string;
            productType: string;
            quantity: number;
            scheduleType: string;
            customDays: import("@prisma/client/runtime/library").JsonValue | null;
            startDate: Date;
            pauseUntil: Date | null;
        };
    }>;
}
export declare class DispatchController {
    private readonly operationsService;
    constructor(operationsService: OperationsService);
    run(payload: Payload, user: AuthenticatedUser): Promise<{
        message: string;
        orders: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            createdBy: string | null;
            updatedBy: string | null;
            status: string;
            quantity: number;
            proofPhotoUrl: string | null;
            subscriptionId: string;
            deliveryDate: Date;
            riderId: string | null;
            deliveredAt: Date | null;
        }[];
    }>;
    orders(): Promise<{
        orders: ({
            subscription: {
                user: {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    deletedAt: Date | null;
                    createdBy: string | null;
                    updatedBy: string | null;
                    name: string;
                    email: string | null;
                    role: string;
                    phone: string;
                    passwordHash: string | null;
                    emailVerifiedAt: Date | null;
                    twoFactorEnabled: boolean;
                    twoFactorSecret: string | null;
                    isBlocked: boolean;
                    lastLoginAt: Date | null;
                };
            } & {
                id: string;
                userId: string;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                createdBy: string | null;
                updatedBy: string | null;
                status: string;
                productType: string;
                quantity: number;
                scheduleType: string;
                customDays: import("@prisma/client/runtime/library").JsonValue | null;
                startDate: Date;
                pauseUntil: Date | null;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            createdBy: string | null;
            updatedBy: string | null;
            status: string;
            quantity: number;
            proofPhotoUrl: string | null;
            subscriptionId: string;
            deliveryDate: Date;
            riderId: string | null;
            deliveredAt: Date | null;
        })[];
    }>;
    deliver(id: string, payload: Payload, user: AuthenticatedUser): Promise<{
        order: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            createdBy: string | null;
            updatedBy: string | null;
            status: string;
            quantity: number;
            proofPhotoUrl: string | null;
            subscriptionId: string;
            deliveryDate: Date;
            riderId: string | null;
            deliveredAt: Date | null;
        };
    }>;
}
export declare class FarmersController {
    private readonly operationsService;
    constructor(operationsService: OperationsService);
    list(): Promise<{
        farmers: {
            role: string;
        }[];
    }>;
    create(payload: Payload, user: AuthenticatedUser): Promise<{
        farmer: {
            role: string;
        };
    }>;
    payouts(id: string): Promise<{
        logs: {
            quantityLiters: number;
            fatPercentage: number;
            snfPercentage: number;
            ratePerLiter: number;
            totalPayout: number;
            farmer: {
                role: string;
            } | null;
        }[];
    }>;
}
export declare class ProcurementController {
    private readonly operationsService;
    constructor(operationsService: OperationsService);
    logs(farmerId?: string): Promise<{
        logs: {
            quantityLiters: number;
            fatPercentage: number;
            snfPercentage: number;
            ratePerLiter: number;
            totalPayout: number;
            farmer: {
                role: string;
            } | null;
        }[];
    }>;
    create(payload: Payload, user: AuthenticatedUser): Promise<{
        log: {
            quantityLiters: number;
            fatPercentage: number;
            snfPercentage: number;
            ratePerLiter: number;
            totalPayout: number;
            farmer: {
                role: string;
            } | null;
        };
    }>;
}
export declare class NotificationsController {
    private readonly operationsService;
    constructor(operationsService: OperationsService);
    list(): Promise<{
        notifications: {
            id: string;
            type: string;
            channel: string;
            phone: string;
            details: {
                [x: string]: unknown;
            };
            body: string;
            status: string;
            createdAt: string;
        }[];
    }>;
    enqueue(payload: Payload, user: AuthenticatedUser): Promise<{
        notification: {
            id: string;
            type: string;
            channel: string;
            phone: string;
            details: {
                [x: string]: unknown;
            };
            body: string;
            status: string;
            createdAt: string;
        };
    }>;
}
export declare class SettingsController {
    private readonly operationsService;
    constructor(operationsService: OperationsService);
    list(): Promise<{
        settings: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            value: import("@prisma/client/runtime/library").JsonValue;
            key: string;
            group: string;
            label: string;
            isSecret: boolean;
        }[];
    }>;
    save(key: string, payload: Payload, user: AuthenticatedUser): Promise<{
        setting: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            value: import("@prisma/client/runtime/library").JsonValue;
            key: string;
            group: string;
            label: string;
            isSecret: boolean;
        };
    }>;
}
export declare class SecurityController {
    private readonly operationsService;
    constructor(operationsService: OperationsService);
    auditLogs(): Promise<{
        auditLogs: {
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
    loginHistory(): Promise<{
        logins: {
            id: string;
            userId: string | null;
            ipAddress: string | null;
            userAgent: string | null;
            createdAt: Date;
            role: string | null;
            status: string;
        }[];
    }>;
}
export declare class RolePermissionsController {
    private readonly operationsService;
    constructor(operationsService: OperationsService);
    permissions(): Promise<{
        permissions: {
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
        }[];
    }>;
}
export {};
