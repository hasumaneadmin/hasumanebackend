import { Prisma } from "@prisma/client";
import type { AuthenticatedRequest } from "../../common/types/authenticated-request.js";
import { PrismaService } from "../../prisma/prisma.service.js";
type JsonRecord = Record<string, unknown>;
export declare class OperationsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    captureLead(payload: JsonRecord, request: AuthenticatedRequest): Promise<{
        id: string;
        submittedAt: string;
    }>;
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
                    details: JsonRecord;
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
    deleteLead(id: string, actorId?: string): Promise<{
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
    subscriptions(): Promise<{
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
            customDays: Prisma.JsonValue | null;
            startDate: Date;
            pauseUntil: Date | null;
        }[];
    }>;
    deleteSubscription(id: string, actorId?: string): Promise<{
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
            customDays: Prisma.JsonValue | null;
            startDate: Date;
            pauseUntil: Date | null;
        };
    }>;
    createSubscription(payload: JsonRecord, actorId?: string): Promise<{
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
            customDays: Prisma.JsonValue | null;
            startDate: Date;
            pauseUntil: Date | null;
        };
    }>;
    updateSubscriptionStatus(id: string, status: string, actorId?: string): Promise<{
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
            customDays: Prisma.JsonValue | null;
            startDate: Date;
            pauseUntil: Date | null;
        };
    }>;
    pauseSubscription(id: string, pauseUntil: string, actorId?: string): Promise<{
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
            customDays: Prisma.JsonValue | null;
            startDate: Date;
            pauseUntil: Date | null;
        };
    }>;
    resumeSubscription(id: string, actorId?: string): Promise<{
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
            customDays: Prisma.JsonValue | null;
            startDate: Date;
            pauseUntil: Date | null;
        };
    }>;
    runDispatch(dateValue?: string, actorId?: string): Promise<{
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
                customDays: Prisma.JsonValue | null;
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
    markDelivered(id: string, payload: JsonRecord, actorId?: string): Promise<{
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
    farmers(): Promise<{
        farmers: {
            role: string;
        }[];
    }>;
    createFarmer(payload: JsonRecord, actorId?: string): Promise<{
        farmer: {
            role: string;
        };
    }>;
    procurementLogs(farmerId?: string): Promise<{
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
    createProcurementLog(payload: JsonRecord, actorId?: string): Promise<{
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
    notifications(): Promise<{
        notifications: {
            id: string;
            type: string;
            channel: string;
            phone: string;
            details: JsonRecord;
            body: string;
            status: string;
            createdAt: string;
        }[];
    }>;
    enqueueNotification(payload: JsonRecord, actorId?: string): Promise<{
        notification: {
            id: string;
            type: string;
            channel: string;
            phone: string;
            details: JsonRecord;
            body: string;
            status: string;
            createdAt: string;
        };
    }>;
    settings(): Promise<{
        settings: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            value: Prisma.JsonValue;
            key: string;
            group: string;
            label: string;
            isSecret: boolean;
        }[];
    }>;
    saveSetting(key: string, payload: JsonRecord, actorId?: string): Promise<{
        setting: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            value: Prisma.JsonValue;
            key: string;
            group: string;
            label: string;
            isSecret: boolean;
        };
    }>;
    auditLogs(): Promise<{
        auditLogs: {
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
    rolePermissions(): Promise<{
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
    private ensureDefaultSettings;
    private ensureRolePermissions;
    private moduleReadLevel;
    private roleLevel;
    private writeAudit;
    private extractAuditValue;
    private toClientLead;
    private toClientUser;
    private toClientProcurementLog;
    private toClientNotification;
    private toClientRole;
    private countBy;
    private sumNumbers;
    private requiredString;
    private optionalString;
    private stringValue;
    private recordValue;
    private toJsonInput;
    private jsonSafe;
    private booleanValue;
    private positiveInt;
    private positiveNumber;
    private normalizeSlug;
    private normalizeSchedule;
    private normalizeSubscriptionStatus;
    private validDate;
    private startOfDay;
    private addDays;
    private dateKey;
}
export {};
