var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { ROLE_HIERARCHY } from "../../common/constants/roles.js";
import { buildPaginationMeta, getPagination } from "../../common/utils/pagination.js";
import { PrismaService } from "../../prisma/prisma.service.js";
import { RESOURCE_REGISTRY } from "./resource-registry.js";
let ResourcesService = class ResourcesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async list(resourceKey, query, user) {
        const config = this.getConfig(resourceKey);
        this.assertRole(user.role, config.minReadRole);
        const delegate = this.getDelegate(config);
        const { page, limit, skip, take } = getPagination(query);
        const where = this.buildWhere(config, query);
        const [records, total] = await Promise.all([
            delegate.findMany({
                where,
                skip,
                take,
                orderBy: { [query.sortBy || config.defaultSort]: query.sortOrder },
            }),
            delegate.count({ where }),
        ]);
        return {
            success: true,
            message: `${config.label} fetched successfully.`,
            data: records,
            meta: buildPaginationMeta(page, limit, total),
        };
    }
    async findOne(resourceKey, id, user) {
        const config = this.getConfig(resourceKey);
        this.assertRole(user.role, config.minReadRole);
        const record = await this.getDelegate(config).findFirst({
            where: this.withSoftDelete(config, { id }),
        });
        if (!record)
            throw new NotFoundException(`${config.label} record not found.`);
        return record;
    }
    async create(resourceKey, data, user) {
        const config = this.getConfig(resourceKey);
        this.assertRole(user.role, config.minWriteRole);
        const record = await this.getDelegate(config).create({
            data: {
                ...data,
                createdBy: user.id,
                updatedBy: user.id,
            },
        });
        await this.audit(user.id, "create", config, record);
        return record;
    }
    async update(resourceKey, id, data, user) {
        const config = this.getConfig(resourceKey);
        this.assertRole(user.role, config.minWriteRole);
        await this.ensureExists(config, id);
        const record = await this.getDelegate(config).update({
            where: { id },
            data: {
                ...data,
                updatedBy: user.id,
            },
        });
        await this.audit(user.id, "update", config, record);
        return record;
    }
    async remove(resourceKey, id, user) {
        const config = this.getConfig(resourceKey);
        this.assertRole(user.role, config.minWriteRole);
        await this.ensureExists(config, id);
        const delegate = this.getDelegate(config);
        const record = config.softDelete
            ? await delegate.update({
                where: { id },
                data: { deletedAt: new Date(), updatedBy: user.id },
            })
            : await delegate.delete({ where: { id } });
        await this.audit(user.id, "delete", config, record);
        return record;
    }
    getConfig(resourceKey) {
        const config = RESOURCE_REGISTRY[resourceKey];
        if (!config)
            throw new NotFoundException(`Unknown resource '${resourceKey}'.`);
        return config;
    }
    getDelegate(config) {
        const delegate = this.prisma[config.model];
        if (!delegate) {
            throw new NotFoundException(`Resource model '${config.model}' is not available.`);
        }
        return delegate;
    }
    buildWhere(config, query) {
        const parsedFilters = this.parseFilters(query.filters);
        const search = query.search?.trim();
        const searchWhere = search && config.searchableFields.length
            ? {
                OR: config.searchableFields.map((field) => ({
                    [field]: { contains: search, mode: "insensitive" },
                })),
            }
            : {};
        return this.withSoftDelete(config, {
            ...parsedFilters,
            ...searchWhere,
        });
    }
    withSoftDelete(config, where) {
        return config.softDelete ? { ...where, deletedAt: null } : where;
    }
    parseFilters(filters) {
        if (!filters)
            return {};
        try {
            const parsed = JSON.parse(filters);
            return parsed && typeof parsed === "object" && !Array.isArray(parsed)
                ? parsed
                : {};
        }
        catch {
            return {};
        }
    }
    assertRole(actual, required) {
        if ((ROLE_HIERARCHY[actual] ?? 0) < (ROLE_HIERARCHY[required] ?? 0)) {
            throw new ForbiddenException("Insufficient permissions for this resource.");
        }
    }
    async ensureExists(config, id) {
        const record = await this.getDelegate(config).findFirst({
            where: this.withSoftDelete(config, { id }),
        });
        if (!record)
            throw new NotFoundException(`${config.label} record not found.`);
    }
    async audit(actorId, action, config, record) {
        await this.prisma.auditLog.create({
            data: {
                userId: actorId,
                actorId,
                action,
                module: config.module,
                entityType: config.model,
                entityId: record && typeof record === "object" && "id" in record ? String(record.id) : undefined,
                newValue: JSON.parse(JSON.stringify(record)),
            },
        });
    }
};
ResourcesService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService])
], ResourcesService);
export { ResourcesService };
//# sourceMappingURL=resources.service.js.map