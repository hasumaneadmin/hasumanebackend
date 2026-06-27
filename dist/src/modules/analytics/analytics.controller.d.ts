import type { Response } from "express";
import { AnalyticsService } from "./analytics.service.js";
import { AnalyticsQueryDto } from "./dto/analytics-query.dto.js";
export declare class AnalyticsController {
    private readonly analyticsService;
    constructor(analyticsService: AnalyticsService);
    overview(query: AnalyticsQueryDto, res: Response): Promise<string | Buffer<ArrayBuffer> | {
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
        range: {
            from: Date;
            to: Date;
        };
        totalUsers: number;
        activeUsers: number;
        totalOrders: number;
    } | {
        range: {
            from: Date;
            to: Date;
        };
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
    } | {
        byStatus: (import(".prisma/client").Prisma.PickEnumerable<import(".prisma/client").Prisma.SubscriptionGroupByOutputType, "status"[]> & {
            _count: {
                _all: number;
            };
        })[];
        activeSubscribers: number;
        newSubscriptions: number;
        subscriptionGrowth: number;
        range: {
            from: Date;
            to: Date;
        };
    } | {
        bySource: (import(".prisma/client").Prisma.PickEnumerable<import(".prisma/client").Prisma.LeadGroupByOutputType, "source"[]> & {
            _count: {
                _all: number;
            };
        })[];
        newLeads: number;
        convertedLeads: number;
        leadConversionRate: number;
        range: {
            from: Date;
            to: Date;
        };
    } | {
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
    } | {
        totalNotifications: number;
        sent: number;
        failed: number;
        pending: number;
        notificationSuccessRate: number;
        range: {
            from: Date;
            to: Date;
        };
    }>;
    orders(query: AnalyticsQueryDto, res: Response): Promise<string | Buffer<ArrayBuffer> | {
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
        range: {
            from: Date;
            to: Date;
        };
        totalUsers: number;
        activeUsers: number;
        totalOrders: number;
    } | {
        range: {
            from: Date;
            to: Date;
        };
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
    } | {
        byStatus: (import(".prisma/client").Prisma.PickEnumerable<import(".prisma/client").Prisma.SubscriptionGroupByOutputType, "status"[]> & {
            _count: {
                _all: number;
            };
        })[];
        activeSubscribers: number;
        newSubscriptions: number;
        subscriptionGrowth: number;
        range: {
            from: Date;
            to: Date;
        };
    } | {
        bySource: (import(".prisma/client").Prisma.PickEnumerable<import(".prisma/client").Prisma.LeadGroupByOutputType, "source"[]> & {
            _count: {
                _all: number;
            };
        })[];
        newLeads: number;
        convertedLeads: number;
        leadConversionRate: number;
        range: {
            from: Date;
            to: Date;
        };
    } | {
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
    } | {
        totalNotifications: number;
        sent: number;
        failed: number;
        pending: number;
        notificationSuccessRate: number;
        range: {
            from: Date;
            to: Date;
        };
    }>;
    subscriptions(query: AnalyticsQueryDto, res: Response): Promise<string | Buffer<ArrayBuffer> | {
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
        range: {
            from: Date;
            to: Date;
        };
        totalUsers: number;
        activeUsers: number;
        totalOrders: number;
    } | {
        range: {
            from: Date;
            to: Date;
        };
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
    } | {
        byStatus: (import(".prisma/client").Prisma.PickEnumerable<import(".prisma/client").Prisma.SubscriptionGroupByOutputType, "status"[]> & {
            _count: {
                _all: number;
            };
        })[];
        activeSubscribers: number;
        newSubscriptions: number;
        subscriptionGrowth: number;
        range: {
            from: Date;
            to: Date;
        };
    } | {
        bySource: (import(".prisma/client").Prisma.PickEnumerable<import(".prisma/client").Prisma.LeadGroupByOutputType, "source"[]> & {
            _count: {
                _all: number;
            };
        })[];
        newLeads: number;
        convertedLeads: number;
        leadConversionRate: number;
        range: {
            from: Date;
            to: Date;
        };
    } | {
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
    } | {
        totalNotifications: number;
        sent: number;
        failed: number;
        pending: number;
        notificationSuccessRate: number;
        range: {
            from: Date;
            to: Date;
        };
    }>;
    leads(query: AnalyticsQueryDto, res: Response): Promise<string | Buffer<ArrayBuffer> | {
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
        range: {
            from: Date;
            to: Date;
        };
        totalUsers: number;
        activeUsers: number;
        totalOrders: number;
    } | {
        range: {
            from: Date;
            to: Date;
        };
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
    } | {
        byStatus: (import(".prisma/client").Prisma.PickEnumerable<import(".prisma/client").Prisma.SubscriptionGroupByOutputType, "status"[]> & {
            _count: {
                _all: number;
            };
        })[];
        activeSubscribers: number;
        newSubscriptions: number;
        subscriptionGrowth: number;
        range: {
            from: Date;
            to: Date;
        };
    } | {
        bySource: (import(".prisma/client").Prisma.PickEnumerable<import(".prisma/client").Prisma.LeadGroupByOutputType, "source"[]> & {
            _count: {
                _all: number;
            };
        })[];
        newLeads: number;
        convertedLeads: number;
        leadConversionRate: number;
        range: {
            from: Date;
            to: Date;
        };
    } | {
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
    } | {
        totalNotifications: number;
        sent: number;
        failed: number;
        pending: number;
        notificationSuccessRate: number;
        range: {
            from: Date;
            to: Date;
        };
    }>;
    inventory(query: AnalyticsQueryDto, res: Response): Promise<string | Buffer<ArrayBuffer> | {
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
        range: {
            from: Date;
            to: Date;
        };
        totalUsers: number;
        activeUsers: number;
        totalOrders: number;
    } | {
        range: {
            from: Date;
            to: Date;
        };
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
    } | {
        byStatus: (import(".prisma/client").Prisma.PickEnumerable<import(".prisma/client").Prisma.SubscriptionGroupByOutputType, "status"[]> & {
            _count: {
                _all: number;
            };
        })[];
        activeSubscribers: number;
        newSubscriptions: number;
        subscriptionGrowth: number;
        range: {
            from: Date;
            to: Date;
        };
    } | {
        bySource: (import(".prisma/client").Prisma.PickEnumerable<import(".prisma/client").Prisma.LeadGroupByOutputType, "source"[]> & {
            _count: {
                _all: number;
            };
        })[];
        newLeads: number;
        convertedLeads: number;
        leadConversionRate: number;
        range: {
            from: Date;
            to: Date;
        };
    } | {
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
    } | {
        totalNotifications: number;
        sent: number;
        failed: number;
        pending: number;
        notificationSuccessRate: number;
        range: {
            from: Date;
            to: Date;
        };
    }>;
    notifications(query: AnalyticsQueryDto, res: Response): Promise<string | Buffer<ArrayBuffer> | {
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
        range: {
            from: Date;
            to: Date;
        };
        totalUsers: number;
        activeUsers: number;
        totalOrders: number;
    } | {
        range: {
            from: Date;
            to: Date;
        };
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
    } | {
        byStatus: (import(".prisma/client").Prisma.PickEnumerable<import(".prisma/client").Prisma.SubscriptionGroupByOutputType, "status"[]> & {
            _count: {
                _all: number;
            };
        })[];
        activeSubscribers: number;
        newSubscriptions: number;
        subscriptionGrowth: number;
        range: {
            from: Date;
            to: Date;
        };
    } | {
        bySource: (import(".prisma/client").Prisma.PickEnumerable<import(".prisma/client").Prisma.LeadGroupByOutputType, "source"[]> & {
            _count: {
                _all: number;
            };
        })[];
        newLeads: number;
        convertedLeads: number;
        leadConversionRate: number;
        range: {
            from: Date;
            to: Date;
        };
    } | {
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
    } | {
        totalNotifications: number;
        sent: number;
        failed: number;
        pending: number;
        notificationSuccessRate: number;
        range: {
            from: Date;
            to: Date;
        };
    }>;
    private respond;
    private load;
}
