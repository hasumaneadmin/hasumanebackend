import { PrismaService } from "../../prisma/prisma.service.js";
import type { AnalyticsQueryDto } from "./dto/analytics-query.dto.js";
type DateRange = {
    from: Date;
    to: Date;
};
export declare class AnalyticsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    overview(query: AnalyticsQueryDto): Promise<{
        activeSubscribers: number;
        subscriptionGrowth: number;
        newLeads: number;
        leadConversionRate: number;
        inventoryUtilization: number;
        lowStockProducts: number;
        notificationSuccessRate: number;
        ordersToday: number;
        ordersThisWeek: number;
        ordersThisMonth: number;
        ordersInRange: number;
        period: "daily" | "weekly" | "monthly" | "custom";
        range: DateRange;
        totalUsers: number;
        activeUsers: number;
        totalOrders: number;
    }>;
    orders(query: AnalyticsQueryDto): Promise<{
        range: DateRange;
        byStatus: (import(".prisma/client").Prisma.PickEnumerable<import(".prisma/client").Prisma.OrderGroupByOutputType, "status"[]> & {
            _sum: {
                total: import("@prisma/client/runtime/library").Decimal | null;
            };
            _count: {
                _all: number;
            };
        })[];
        revenue: {
            subtotal: number;
            taxAmount: number;
            shippingFee: number;
            discount: number;
            total: number;
        };
        recentOrders: ({
            user: {
                id: string;
                name: string;
                phone: string;
            } | null;
            items: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                total: import("@prisma/client/runtime/library").Decimal;
                productId: string | null;
                sku: string | null;
                variantId: string | null;
                taxAmount: import("@prisma/client/runtime/library").Decimal;
                orderId: string;
                quantity: import("@prisma/client/runtime/library").Decimal;
                unitPrice: import("@prisma/client/runtime/library").Decimal;
            }[];
        } & {
            id: string;
            userId: string | null;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            createdBy: string | null;
            updatedBy: string | null;
            total: import("@prisma/client/runtime/library").Decimal;
            status: string;
            orderNumber: string;
            subtotal: import("@prisma/client/runtime/library").Decimal;
            taxAmount: import("@prisma/client/runtime/library").Decimal;
            shippingFee: import("@prisma/client/runtime/library").Decimal;
            discount: import("@prisma/client/runtime/library").Decimal;
            currency: string;
        })[];
    }>;
    subscriptions(query: AnalyticsQueryDto): Promise<{
        byStatus: (import(".prisma/client").Prisma.PickEnumerable<import(".prisma/client").Prisma.SubscriptionGroupByOutputType, "status"[]> & {
            _count: {
                _all: number;
            };
        })[];
        activeSubscribers: number;
        newSubscriptions: number;
        subscriptionGrowth: number;
        range: DateRange;
    }>;
    leads(query: AnalyticsQueryDto): Promise<{
        bySource: (import(".prisma/client").Prisma.PickEnumerable<import(".prisma/client").Prisma.LeadGroupByOutputType, "source"[]> & {
            _count: {
                _all: number;
            };
        })[];
        newLeads: number;
        convertedLeads: number;
        leadConversionRate: number;
        range: DateRange;
    }>;
    inventory(): Promise<{
        inventoryItems: number;
        lowStockProducts: number;
        outOfStockProducts: number;
        inventoryUtilization: number;
        lowStock: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            createdBy: string | null;
            updatedBy: string | null;
            status: string;
            unit: string;
            productId: string | null;
            sku: string | null;
            variantId: string | null;
            currentStock: import("@prisma/client/runtime/library").Decimal;
            reservedStock: import("@prisma/client/runtime/library").Decimal;
            reorderLevel: import("@prisma/client/runtime/library").Decimal;
            warehouseName: string | null;
        }[];
    }>;
    notifications(query: AnalyticsQueryDto): Promise<{
        totalNotifications: number;
        sent: number;
        failed: number;
        pending: number;
        notificationSuccessRate: number;
        range: DateRange;
    }>;
    toCsv(payload: unknown): string;
    toPdf(payload: unknown, title: string): Buffer<ArrayBuffer>;
    private orderWindowMetrics;
    private subscriptionMetrics;
    private leadMetrics;
    private inventoryMetrics;
    private notificationMetrics;
    private resolveRange;
    private startOfDay;
    private flatten;
}
export {};
