var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import { buildPaginationMeta, getPagination } from "../../common/utils/pagination.js";
import { PrismaService } from "../../prisma/prisma.service.js";
let OrdersService = class OrdersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getCart(userId) {
        const cart = await this.findActiveCart(userId);
        return {
            cart,
            totals: this.calculateCartTotals(cart?.items ?? []),
        };
    }
    async addToCart(userId, dto) {
        if (!dto.productId && !dto.variantId) {
            throw new BadRequestException("Either productId or variantId is required.");
        }
        return this.prisma.$transaction(async (tx) => {
            const cart = await this.ensureActiveCart(tx, userId);
            const pricedItem = await this.priceRequestedItem(tx, {
                productId: dto.productId,
                variantId: dto.variantId,
                quantity: dto.quantity,
            });
            const existingItem = await tx.cartItem.findFirst({
                where: {
                    cartId: cart.id,
                    productId: pricedItem.productId,
                    variantId: pricedItem.variantId ?? null,
                },
            });
            if (existingItem) {
                return tx.cartItem.update({
                    where: { id: existingItem.id },
                    data: {
                        quantity: Number(existingItem.quantity) + dto.quantity,
                        unitPrice: pricedItem.unitPrice,
                    },
                });
            }
            return tx.cartItem.create({
                data: {
                    cartId: cart.id,
                    productId: pricedItem.productId,
                    variantId: pricedItem.variantId,
                    quantity: dto.quantity,
                    unitPrice: pricedItem.unitPrice,
                },
            });
        });
    }
    async updateCartItem(userId, dto) {
        const item = await this.ensureCartItemOwnedByUser(userId, dto.itemId);
        return this.prisma.cartItem.update({
            where: { id: item.id },
            data: { quantity: dto.quantity },
        });
    }
    async removeCartItem(userId, itemId) {
        const item = await this.ensureCartItemOwnedByUser(userId, itemId);
        return this.prisma.cartItem.delete({ where: { id: item.id } });
    }
    async createOrder(userId, dto) {
        return this.prisma.$transaction(async (tx) => {
            const sourceItems = dto.items?.length
                ? dto.items
                : await this.getCartOrderItems(tx, userId, dto.cartId);
            if (!sourceItems.length) {
                throw new BadRequestException("Order requires at least one item.");
            }
            const orderItems = await Promise.all(sourceItems.map((item) => this.priceRequestedItem(tx, item)));
            const subtotal = orderItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
            const calculatedTax = orderItems.reduce((sum, item) => sum + item.taxAmount, 0);
            const taxAmount = dto.taxAmount ?? calculatedTax;
            const shippingFee = dto.shippingFee ?? 0;
            const discount = dto.discount ?? 0;
            const total = Math.max(0, subtotal + taxAmount + shippingFee - discount);
            const order = await tx.order.create({
                data: {
                    orderNumber: this.generateOrderNumber(),
                    userId,
                    subtotal,
                    taxAmount,
                    shippingFee,
                    discount,
                    total,
                    currency: dto.currency ?? "INR",
                    createdBy: userId,
                    updatedBy: userId,
                    items: {
                        create: orderItems.map((item) => ({
                            productId: item.productId,
                            variantId: item.variantId,
                            sku: item.sku,
                            name: item.name,
                            quantity: item.quantity,
                            unitPrice: item.unitPrice,
                            taxAmount: item.taxAmount,
                            total: item.total,
                        })),
                    },
                    statusHistory: {
                        create: {
                            status: "pending",
                            note: "Order created.",
                            changedBy: userId,
                        },
                    },
                },
                include: this.orderInclude(),
            });
            if (!dto.items?.length) {
                await tx.cart.updateMany({
                    where: { userId, status: "active", ...(dto.cartId ? { id: dto.cartId } : {}) },
                    data: { status: "converted", updatedBy: userId },
                });
            }
            await tx.auditLog.create({
                data: {
                    userId,
                    actorId: userId,
                    action: "create",
                    module: "orders",
                    entityType: "order",
                    entityId: order.id,
                    newValue: this.toJson(order),
                },
            });
            return order;
        });
    }
    async listOrders(userId, query) {
        const { page, limit, skip, take } = getPagination(query);
        const where = { userId, deletedAt: null };
        const [orders, total] = await this.prisma.$transaction([
            this.prisma.order.findMany({
                where,
                skip,
                take,
                orderBy: { [query.sortBy || "createdAt"]: query.sortOrder },
                include: this.orderInclude(),
            }),
            this.prisma.order.count({ where }),
        ]);
        return {
            success: true,
            message: "Orders fetched.",
            data: orders,
            meta: buildPaginationMeta(page, limit, total),
        };
    }
    async getOrder(userId, id) {
        const order = await this.prisma.order.findFirst({
            where: { id, deletedAt: null },
            include: this.orderInclude(),
        });
        if (!order)
            throw new NotFoundException("Order not found.");
        if (order.userId !== userId)
            throw new ForbiddenException("You cannot access this order.");
        return order;
    }
    async cancelOrder(userId, id) {
        const order = await this.getOrder(userId, id);
        if (["cancelled", "delivered", "refunded"].includes(order.status)) {
            throw new BadRequestException(`Order cannot be cancelled from '${order.status}' status.`);
        }
        return this.prisma.$transaction(async (tx) => {
            const updatedOrder = await tx.order.update({
                where: { id },
                data: { status: "cancelled", updatedBy: userId },
                include: this.orderInclude(),
            });
            await tx.orderStatusHistory.create({
                data: {
                    orderId: id,
                    status: "cancelled",
                    note: "Cancelled by customer.",
                    changedBy: userId,
                },
            });
            await tx.auditLog.create({
                data: {
                    userId,
                    actorId: userId,
                    action: "cancel",
                    module: "orders",
                    entityType: "order",
                    entityId: id,
                    oldValue: this.toJson(order),
                    newValue: this.toJson(updatedOrder),
                },
            });
            return updatedOrder;
        });
    }
    async findActiveCart(userId) {
        return this.prisma.cart.findFirst({
            where: { userId, status: "active", deletedAt: null },
            include: { items: { include: { product: true, variant: true } } },
            orderBy: { createdAt: "desc" },
        });
    }
    async ensureActiveCart(tx, userId) {
        const cart = await tx.cart.findFirst({
            where: { userId, status: "active", deletedAt: null },
            orderBy: { createdAt: "desc" },
        });
        if (cart)
            return cart;
        return tx.cart.create({
            data: {
                userId,
                createdBy: userId,
                updatedBy: userId,
            },
        });
    }
    async ensureCartItemOwnedByUser(userId, itemId) {
        const item = await this.prisma.cartItem.findFirst({
            where: {
                id: itemId,
                cart: { userId, status: "active", deletedAt: null },
            },
        });
        if (!item)
            throw new NotFoundException("Cart item not found.");
        return item;
    }
    async getCartOrderItems(tx, userId, cartId) {
        const cart = await tx.cart.findFirst({
            where: {
                userId,
                status: "active",
                deletedAt: null,
                ...(cartId ? { id: cartId } : {}),
            },
            include: { items: true },
            orderBy: { createdAt: "desc" },
        });
        if (!cart)
            throw new NotFoundException("Active cart not found.");
        return cart.items.map((item) => ({
            productId: item.productId ?? undefined,
            variantId: item.variantId ?? undefined,
            quantity: Number(item.quantity),
            unitPrice: item.unitPrice ? Number(item.unitPrice) : undefined,
        }));
    }
    async priceRequestedItem(tx, item) {
        if (!item.productId && !item.variantId) {
            throw new BadRequestException("Every order item requires productId or variantId.");
        }
        const variant = item.variantId
            ? (await tx.productVariant.findFirst({
                where: { id: item.variantId, deletedAt: null, isActive: true },
                include: { product: true },
            }))
            : null;
        const product = item.productId
            ? (await tx.product.findFirst({
                where: { id: item.productId, deletedAt: null, isActive: true },
            }))
            : variant?.product ?? null;
        if (!product)
            throw new NotFoundException("Product not found or inactive.");
        if (item.variantId && !variant)
            throw new NotFoundException("Product variant not found or inactive.");
        const quantity = Number(item.quantity);
        const unitPrice = Number(item.unitPrice ?? variant?.price ?? product.price ?? 0);
        const lineSubtotal = quantity * unitPrice;
        const taxPercent = Number(product.taxPercent ?? 0);
        const taxAmount = Number(((lineSubtotal * taxPercent) / 100).toFixed(2));
        const total = Number((lineSubtotal + taxAmount).toFixed(2));
        return {
            productId: product.id,
            variantId: variant?.id,
            sku: variant?.sku ?? product.code,
            name: variant ? `${product.name} - ${variant.name}` : product.name,
            quantity,
            unitPrice,
            taxAmount,
            total,
        };
    }
    calculateCartTotals(items) {
        const subtotal = items.reduce((sum, item) => sum + Number(item.quantity) * Number(item.unitPrice ?? 0), 0);
        return {
            itemCount: items.length,
            subtotal: Number(subtotal.toFixed(2)),
        };
    }
    generateOrderNumber() {
        const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
        return `ORD-${date}-${randomUUID().slice(0, 8).toUpperCase()}`;
    }
    toJson(value) {
        return JSON.parse(JSON.stringify(value));
    }
    orderInclude() {
        return {
            user: { select: { id: true, name: true, phone: true, email: true } },
            items: true,
            payments: true,
            refunds: true,
            deliveryAssignments: true,
            trackingLogs: true,
            statusHistory: { orderBy: { createdAt: "desc" } },
        };
    }
};
OrdersService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService])
], OrdersService);
export { OrdersService };
//# sourceMappingURL=orders.service.js.map