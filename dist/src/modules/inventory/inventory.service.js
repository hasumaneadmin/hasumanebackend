var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service.js";
let InventoryService = class InventoryService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async list() {
        const items = await this.prisma.inventoryItem.findMany({
            where: { deletedAt: null },
            orderBy: { updatedAt: "desc" },
            include: { product: true, variant: true },
        });
        return { items };
    }
    async lowStock() {
        const items = await this.prisma.inventoryItem.findMany({
            where: { deletedAt: null },
            include: { product: true, variant: true },
        });
        return {
            items: items.filter((item) => Number(item.currentStock) <= Number(item.reorderLevel)),
        };
    }
    async outOfStock() {
        const items = await this.prisma.inventoryItem.findMany({
            where: { deletedAt: null, currentStock: { lte: 0 } },
            include: { product: true, variant: true },
        });
        return { items };
    }
    async movements(inventoryItemId) {
        const movements = await this.prisma.stockMovement.findMany({
            where: { deletedAt: null, ...(inventoryItemId ? { inventoryItemId } : {}) },
            orderBy: { createdAt: "desc" },
            take: 300,
            include: { inventoryItem: { include: { product: true, variant: true } } },
        });
        return { movements };
    }
    async create(dto, actorId) {
        const existing = await this.prisma.inventoryItem.findFirst({
            where: {
                deletedAt: null,
                productId: dto.productId,
                ...(dto.variantId ? { variantId: dto.variantId } : { variantId: null }),
            },
        });
        if (existing) {
            throw new ConflictException("Inventory item already exists for this product.");
        }
        const created = await this.prisma.inventoryItem.create({
            data: {
                productId: dto.productId,
                variantId: dto.variantId,
                currentStock: dto.currentStock,
                reservedStock: dto.reservedStock ?? 0,
                reorderLevel: dto.reorderLevel ?? 0,
                unit: dto.unit || "unit",
                sku: dto.sku,
                warehouseName: dto.warehouseName,
                status: this.status(dto.currentStock, dto.reorderLevel ?? 0),
                createdBy: actorId,
                updatedBy: actorId,
            },
            include: { product: true, variant: true },
        });
        await this.prisma.auditLog.create({
            data: {
                userId: actorId,
                actorId,
                action: "create",
                module: "inventory",
                entityType: "inventory_item",
                entityId: created.id,
                newValue: this.toJson(created),
            },
        });
        return { item: created };
    }
    async adjust(id, dto, actorId) {
        return this.prisma.$transaction(async (tx) => {
            const existing = await tx.inventoryItem.findFirst({ where: { id, deletedAt: null } });
            if (!existing)
                throw new NotFoundException("Inventory item not found.");
            const movement = await tx.stockMovement.create({
                data: {
                    inventoryItemId: id,
                    movementType: dto.movementType,
                    quantity: dto.quantity,
                    reason: dto.reason,
                    referenceType: dto.referenceType,
                    referenceId: dto.referenceId,
                    createdById: actorId,
                    updatedBy: actorId,
                },
            });
            const nextStock = this.nextStock(existing, dto);
            const updated = await tx.inventoryItem.update({
                where: { id },
                data: {
                    currentStock: nextStock.currentStock,
                    reservedStock: nextStock.reservedStock,
                    status: this.status(nextStock.currentStock, Number(existing.reorderLevel)),
                    updatedBy: actorId,
                },
            });
            await tx.auditLog.create({
                data: {
                    userId: actorId,
                    actorId,
                    action: "stock_adjustment",
                    module: "inventory",
                    entityType: "inventory_item",
                    entityId: id,
                    oldValue: this.toJson(existing),
                    newValue: this.toJson(updated),
                    metadata: this.toJson({ movement }),
                },
            });
            return { item: updated, movement };
        });
    }
    async remove(id, actorId) {
        const existing = await this.prisma.inventoryItem.findFirst({ where: { id, deletedAt: null } });
        if (!existing)
            throw new NotFoundException("Inventory item not found.");
        const updated = await this.prisma.inventoryItem.update({
            where: { id },
            data: { deletedAt: new Date(), updatedBy: actorId },
            include: { product: true, variant: true },
        });
        await this.prisma.auditLog.create({
            data: {
                userId: actorId,
                actorId,
                action: "delete",
                module: "inventory",
                entityType: "inventory_item",
                entityId: id,
                oldValue: this.toJson(existing),
                newValue: this.toJson(updated),
            },
        });
        return { item: updated };
    }
    nextStock(item, dto) {
        let currentStock = Number(item.currentStock);
        let reservedStock = Number(item.reservedStock);
        if (dto.movementType === "in")
            currentStock += dto.quantity;
        if (dto.movementType === "out")
            currentStock -= dto.quantity;
        if (dto.movementType === "adjustment")
            currentStock = dto.quantity;
        if (dto.movementType === "reserved")
            reservedStock += dto.quantity;
        if (dto.movementType === "released")
            reservedStock = Math.max(0, reservedStock - dto.quantity);
        return {
            currentStock: Math.max(0, currentStock),
            reservedStock: Math.max(0, reservedStock),
        };
    }
    status(currentStock, reorderLevel) {
        if (currentStock <= 0)
            return "out_of_stock";
        if (reorderLevel > 0 && currentStock <= reorderLevel)
            return "low_stock";
        return "in_stock";
    }
    toJson(value) {
        return JSON.parse(JSON.stringify(value));
    }
};
InventoryService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService])
], InventoryService);
export { InventoryService };
//# sourceMappingURL=inventory.service.js.map