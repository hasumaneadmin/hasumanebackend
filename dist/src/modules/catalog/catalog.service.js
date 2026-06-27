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
import { AuditLogService } from "../audit/audit-log.service.js";
let CatalogService = class CatalogService {
    prisma;
    auditLogService;
    constructor(prisma, auditLogService) {
        this.prisma = prisma;
        this.auditLogService = auditLogService;
    }
    async listProducts(query) {
        const { page, limit, skip, take } = getPagination(query);
        const where = {
            deletedAt: null,
            ...(query.search
                ? {
                    OR: [
                        { name: { contains: query.search, mode: "insensitive" } },
                        { code: { contains: query.search, mode: "insensitive" } },
                        { productType: { contains: query.search, mode: "insensitive" } },
                    ],
                }
                : {}),
        };
        const [products, total] = await this.prisma.$transaction([
            this.prisma.product.findMany({
                where,
                skip,
                take,
                orderBy: query.sortBy ? { [query.sortBy]: query.sortOrder } : { sortOrder: "asc" },
                include: { category: true, variants: true, images: true },
            }),
            this.prisma.product.count({ where }),
        ]);
        return { success: true, message: "Products fetched.", data: products, meta: buildPaginationMeta(page, limit, total) };
    }
    async searchProducts(query) {
        return this.listProducts({ ...query, search: query.search || "" });
    }
    async getProduct(id) {
        const product = await this.prisma.product.findFirst({
            where: { id, deletedAt: null },
            include: { category: true, variants: true, images: true, inventoryItems: true },
        });
        if (!product)
            throw new NotFoundException("Product not found.");
        return product;
    }
    async createProduct(dto, actorId) {
        const product = await this.prisma.product.create({
            data: this.toProductCreateInput(dto, actorId),
        });
        await this.auditLogService.record({
            userId: actorId,
            action: "create",
            module: "products",
            entityType: "product",
            entityId: product.id,
            newValue: product,
        });
        return product;
    }
    async updateProduct(id, dto, actorId) {
        const existing = await this.getProduct(id);
        const product = await this.prisma.product.update({
            where: { id },
            data: this.toProductUpdateInput(dto, actorId),
        });
        await this.auditLogService.record({
            userId: actorId,
            action: "update",
            module: "products",
            entityType: "product",
            entityId: id,
            oldValue: existing,
            newValue: product,
        });
        return product;
    }
    async deleteProduct(id, actorId) {
        const existing = await this.getProduct(id);
        const product = await this.prisma.product.update({
            where: { id },
            data: { deletedAt: new Date(), updatedBy: actorId },
        });
        await this.auditLogService.record({
            userId: actorId,
            action: "delete",
            module: "products",
            entityType: "product",
            entityId: id,
            oldValue: existing,
            newValue: product,
        });
        return product;
    }
    listCategories() {
        return this.prisma.productCategory.findMany({
            where: { deletedAt: null },
            orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
        });
    }
    async createCategory(dto, actorId) {
        const category = await this.prisma.productCategory.create({
            data: { ...dto, createdBy: actorId, updatedBy: actorId },
        });
        await this.auditLogService.record({
            userId: actorId,
            action: "create",
            module: "categories",
            entityType: "product_category",
            entityId: category.id,
            newValue: category,
        });
        return category;
    }
    async updateCategory(id, dto, actorId) {
        const existing = await this.ensureCategory(id);
        const category = await this.prisma.productCategory.update({
            where: { id },
            data: { ...dto, updatedBy: actorId },
        });
        await this.auditLogService.record({
            userId: actorId,
            action: "update",
            module: "categories",
            entityType: "product_category",
            entityId: id,
            oldValue: existing,
            newValue: category,
        });
        return category;
    }
    async deleteCategory(id, actorId) {
        const existing = await this.ensureCategory(id);
        const category = await this.prisma.productCategory.update({
            where: { id },
            data: { deletedAt: new Date(), isActive: false, updatedBy: actorId },
        });
        await this.auditLogService.record({
            userId: actorId,
            action: "delete",
            module: "categories",
            entityType: "product_category",
            entityId: id,
            oldValue: existing,
            newValue: category,
        });
        return category;
    }
    async ensureCategory(id) {
        const category = await this.prisma.productCategory.findFirst({ where: { id, deletedAt: null } });
        if (!category)
            throw new NotFoundException("Category not found.");
        return category;
    }
    toProductCreateInput(dto, actorId) {
        return {
            code: dto.code,
            name: dto.name,
            productType: dto.productType,
            categoryId: dto.categoryId || null,
            unit: dto.unit,
            price: dto.price ?? null,
            compareAtPrice: dto.compareAtPrice ?? null,
            taxPercent: dto.taxPercent ?? null,
            defaultQuantity: dto.defaultQuantity,
            defaultSchedule: dto.defaultSchedule,
            description: dto.description,
            ...(dto.tags !== undefined ? { tags: dto.tags } : {}),
            isActive: dto.isActive,
            sortOrder: dto.sortOrder ?? 0,
            createdBy: actorId,
            updatedBy: actorId,
        };
    }
    toProductUpdateInput(dto, actorId) {
        return {
            ...(dto.code !== undefined ? { code: dto.code } : {}),
            ...(dto.name !== undefined ? { name: dto.name } : {}),
            ...(dto.productType !== undefined ? { productType: dto.productType } : {}),
            ...(dto.categoryId !== undefined ? { categoryId: dto.categoryId || null } : {}),
            ...(dto.unit !== undefined ? { unit: dto.unit } : {}),
            ...(dto.price !== undefined ? { price: dto.price } : {}),
            ...(dto.compareAtPrice !== undefined ? { compareAtPrice: dto.compareAtPrice } : {}),
            ...(dto.taxPercent !== undefined ? { taxPercent: dto.taxPercent } : {}),
            ...(dto.defaultQuantity !== undefined ? { defaultQuantity: dto.defaultQuantity } : {}),
            ...(dto.defaultSchedule !== undefined ? { defaultSchedule: dto.defaultSchedule } : {}),
            ...(dto.description !== undefined ? { description: dto.description } : {}),
            ...(dto.tags !== undefined ? { tags: dto.tags } : {}),
            ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
            ...(dto.sortOrder !== undefined ? { sortOrder: dto.sortOrder } : {}),
            updatedBy: actorId,
        };
    }
};
CatalogService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService,
        AuditLogService])
], CatalogService);
export { CatalogService };
//# sourceMappingURL=catalog.service.js.map