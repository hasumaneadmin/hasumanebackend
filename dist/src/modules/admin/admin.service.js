var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable, NotFoundException } from "@nestjs/common";
import { buildPaginationMeta, getPagination } from "../../common/utils/pagination.js";
import { PrismaService } from "../../prisma/prisma.service.js";
import { CatalogService } from "../catalog/catalog.service.js";
let AdminService = class AdminService {
    prisma;
    catalogService;
    constructor(prisma, catalogService) {
        this.prisma = prisma;
        this.catalogService = catalogService;
    }
    async dashboard() {
        const [totalUsers, activeProducts, pendingOrders, activeDeliveries, inventoryAlerts, revenue, recentOrders,] = await this.prisma.$transaction([
            this.prisma.user.count({ where: { deletedAt: null } }),
            this.prisma.product.count({ where: { deletedAt: null, isActive: true } }),
            this.prisma.order.count({ where: { deletedAt: null, status: { in: ["pending", "processing"] } } }),
            this.prisma.deliveryAssignment.count({ where: { deletedAt: null, status: { in: ["assigned", "in_transit"] } } }),
            this.prisma.inventoryItem.count({
                where: {
                    deletedAt: null,
                    OR: [{ status: "low_stock" }, { currentStock: { lte: this.prisma.inventoryItem.fields.reorderLevel } }],
                },
            }),
            this.prisma.order.aggregate({
                where: { deletedAt: null, status: { notIn: ["cancelled", "refunded"] } },
                _sum: { total: true },
            }),
            this.prisma.order.findMany({
                where: { deletedAt: null },
                orderBy: { createdAt: "desc" },
                take: 8,
                include: { user: { select: { id: true, name: true, phone: true, email: true } }, items: true },
            }),
        ]);
        return {
            cards: {
                totalUsers,
                activeProducts,
                pendingOrders,
                activeDeliveries,
                inventoryAlerts,
                totalRevenue: Number(revenue._sum.total ?? 0),
            },
            recentOrders,
        };
    }
    async users(query) {
        const { page, limit, skip, take } = getPagination(query);
        const where = {
            deletedAt: null,
            ...(query.search
                ? {
                    OR: [
                        { name: { contains: query.search, mode: "insensitive" } },
                        { phone: { contains: query.search, mode: "insensitive" } },
                        { email: { contains: query.search, mode: "insensitive" } },
                    ],
                }
                : {}),
        };
        const [users, total] = await this.prisma.$transaction([
            this.prisma.user.findMany({
                where,
                skip,
                take,
                orderBy: { [query.sortBy || "createdAt"]: query.sortOrder },
                select: {
                    id: true,
                    name: true,
                    phone: true,
                    email: true,
                    role: true,
                    isBlocked: true,
                    emailVerifiedAt: true,
                    lastLoginAt: true,
                    createdAt: true,
                },
            }),
            this.prisma.user.count({ where }),
        ]);
        return { success: true, message: "Admin users fetched.", data: users, meta: buildPaginationMeta(page, limit, total) };
    }
    async orders(query) {
        const { page, limit, skip, take } = getPagination(query);
        const where = {
            deletedAt: null,
            ...(query.search
                ? {
                    OR: [
                        { orderNumber: { contains: query.search, mode: "insensitive" } },
                        { status: { contains: query.search, mode: "insensitive" } },
                    ],
                }
                : {}),
        };
        const [orders, total] = await this.prisma.$transaction([
            this.prisma.order.findMany({
                where,
                skip,
                take,
                orderBy: { [query.sortBy || "createdAt"]: query.sortOrder },
                include: {
                    user: { select: { id: true, name: true, phone: true, email: true } },
                    items: true,
                    payments: true,
                    deliveryAssignments: true,
                },
            }),
            this.prisma.order.count({ where }),
        ]);
        return { success: true, message: "Admin orders fetched.", data: orders, meta: buildPaginationMeta(page, limit, total) };
    }
    products(query) {
        return this.catalogService.listProducts(query);
    }
    createProduct(dto, actorId) {
        return this.catalogService.createProduct(dto, actorId);
    }
    updateProduct(id, dto, actorId) {
        return this.catalogService.updateProduct(id, dto, actorId);
    }
    deleteProduct(id, actorId) {
        return this.catalogService.deleteProduct(id, actorId);
    }
    async reports() {
        const now = new Date();
        const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
        const [monthlySales, refunds, generatedReports] = await this.prisma.$transaction([
            this.prisma.order.aggregate({
                where: {
                    deletedAt: null,
                    createdAt: { gte: startOfMonth },
                    status: { notIn: ["cancelled", "refunded"] },
                },
                _count: true,
                _sum: { subtotal: true, taxAmount: true, shippingFee: true, discount: true, total: true },
            }),
            this.prisma.refundRequest.aggregate({
                where: { deletedAt: null, createdAt: { gte: startOfMonth } },
                _count: true,
                _sum: { amount: true },
            }),
            this.prisma.salesReport.findMany({
                orderBy: { periodStart: "desc" },
                take: 12,
            }),
        ]);
        return {
            currentMonth: {
                orderCount: monthlySales._count,
                grossRevenue: Number(monthlySales._sum.subtotal ?? 0),
                taxes: Number(monthlySales._sum.taxAmount ?? 0),
                shipping: Number(monthlySales._sum.shippingFee ?? 0),
                discounts: Number(monthlySales._sum.discount ?? 0),
                netRevenue: Number(monthlySales._sum.total ?? 0),
                refundCount: refunds._count,
                refundAmount: Number(refunds._sum.amount ?? 0),
            },
            generatedReports,
        };
    }
    async analytics() {
        const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const [pageViews, userActivity, newCustomers, orderStatusBreakdown, productStatusBreakdown] = await this.prisma.$transaction([
            this.prisma.pageView.count({ where: { createdAt: { gte: since } } }),
            this.prisma.userActivity.findMany({ orderBy: { createdAt: "desc" }, take: 20 }),
            this.prisma.user.count({ where: { role: "CUSTOMER", deletedAt: null, createdAt: { gte: since } } }),
            this.prisma.order.groupBy({
                by: ["status"],
                where: { deletedAt: null, createdAt: { gte: since } },
                orderBy: { status: "asc" },
                _count: { _all: true },
                _sum: { total: true },
            }),
            this.prisma.product.groupBy({
                by: ["isActive"],
                where: { deletedAt: null },
                orderBy: { isActive: "desc" },
                _count: { _all: true },
            }),
        ]);
        return {
            windowDays: 30,
            pageViews,
            newCustomers,
            orderStatusBreakdown,
            productStatusBreakdown,
            userActivity,
        };
    }
    async logs(query) {
        const { page, limit, skip, take } = getPagination(query);
        const where = query.search
            ? {
                OR: [
                    { action: { contains: query.search, mode: "insensitive" } },
                    { module: { contains: query.search, mode: "insensitive" } },
                    { entityType: { contains: query.search, mode: "insensitive" } },
                ],
            }
            : {};
        const [auditLogs, total, recentLogins] = await this.prisma.$transaction([
            this.prisma.auditLog.findMany({
                where,
                skip,
                take,
                orderBy: { createdAt: "desc" },
            }),
            this.prisma.auditLog.count({ where }),
            this.prisma.loginHistory.findMany({
                orderBy: { createdAt: "desc" },
                take: 20,
            }),
        ]);
        return {
            success: true,
            message: "Admin logs fetched.",
            data: { auditLogs, recentLogins },
            meta: buildPaginationMeta(page, limit, total),
        };
    }
    async updateOrderStatus(id, status, actorId) {
        const existing = await this.prisma.order.findUnique({
            where: { id },
        });
        if (!existing) {
            throw new NotFoundException(`Order with ID ${id} not found.`);
        }
        const updated = await this.prisma.order.update({
            where: { id },
            data: {
                status,
                updatedBy: actorId,
            },
        });
        await this.prisma.orderStatusHistory.create({
            data: {
                orderId: id,
                status,
                note: `Status updated to ${status} by admin/manager.`,
                changedBy: actorId,
            },
        });
        await this.prisma.auditLog.create({
            data: {
                userId: existing.userId,
                actorId,
                action: "update_status",
                module: "orders",
                entityType: "order",
                entityId: id,
                oldValue: { status: existing.status },
                newValue: { status },
            },
        });
        return { success: true, message: `Order status updated to ${status}.`, order: updated };
    }
};
AdminService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService,
        CatalogService])
], AdminService);
export { AdminService };
//# sourceMappingURL=admin.service.js.map