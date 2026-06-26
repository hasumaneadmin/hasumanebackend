import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { ROLE_HIERARCHY } from "../../common/constants/roles.js";
import type { Role } from "../../common/constants/roles.js";
import { PaginationQueryDto } from "../../common/dto/pagination-query.dto.js";
import type { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { buildPaginationMeta, getPagination } from "../../common/utils/pagination.js";
import { PrismaService } from "../../prisma/prisma.service.js";
import { RESOURCE_REGISTRY, type ResourceConfig } from "./resource-registry.js";

type PrismaDelegate = {
  findMany(args: Record<string, unknown>): Promise<unknown[]>;
  findFirst(args: Record<string, unknown>): Promise<unknown | null>;
  count(args: Record<string, unknown>): Promise<number>;
  create(args: Record<string, unknown>): Promise<unknown>;
  update(args: Record<string, unknown>): Promise<unknown>;
  delete(args: Record<string, unknown>): Promise<unknown>;
};

@Injectable()
export class ResourcesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(resourceKey: string, query: PaginationQueryDto, user: AuthenticatedUser) {
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

  async findOne(resourceKey: string, id: string, user: AuthenticatedUser) {
    const config = this.getConfig(resourceKey);
    this.assertRole(user.role, config.minReadRole);
    const record = await this.getDelegate(config).findFirst({
      where: this.withSoftDelete(config, { id }),
    });
    if (!record) throw new NotFoundException(`${config.label} record not found.`);
    return record;
  }

  async create(resourceKey: string, data: Record<string, unknown>, user: AuthenticatedUser) {
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

  async update(
    resourceKey: string,
    id: string,
    data: Record<string, unknown>,
    user: AuthenticatedUser,
  ) {
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

  async remove(resourceKey: string, id: string, user: AuthenticatedUser) {
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

  private getConfig(resourceKey: string) {
    const config = RESOURCE_REGISTRY[resourceKey];
    if (!config) throw new NotFoundException(`Unknown resource '${resourceKey}'.`);
    return config;
  }

  private getDelegate(config: ResourceConfig) {
    const delegate = (this.prisma as unknown as Record<string, PrismaDelegate>)[config.model];
    if (!delegate) {
      throw new NotFoundException(`Resource model '${config.model}' is not available.`);
    }
    return delegate;
  }

  private buildWhere(config: ResourceConfig, query: PaginationQueryDto) {
    const parsedFilters = this.parseFilters(query.filters);
    const search = query.search?.trim();
    const searchWhere =
      search && config.searchableFields.length
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

  private withSoftDelete(config: ResourceConfig, where: Record<string, unknown>) {
    return config.softDelete ? { ...where, deletedAt: null } : where;
  }

  private parseFilters(filters?: string) {
    if (!filters) return {};
    try {
      const parsed = JSON.parse(filters) as unknown;
      return parsed && typeof parsed === "object" && !Array.isArray(parsed)
        ? (parsed as Record<string, unknown>)
        : {};
    } catch {
      return {};
    }
  }

  private assertRole(actual: Role, required: Role) {
    if ((ROLE_HIERARCHY[actual] ?? 0) < (ROLE_HIERARCHY[required] ?? 0)) {
      throw new ForbiddenException("Insufficient permissions for this resource.");
    }
  }

  private async ensureExists(config: ResourceConfig, id: string) {
    const record = await this.getDelegate(config).findFirst({
      where: this.withSoftDelete(config, { id }),
    });
    if (!record) throw new NotFoundException(`${config.label} record not found.`);
  }

  private async audit(
    actorId: string,
    action: string,
    config: ResourceConfig,
    record: unknown,
  ) {
    await this.prisma.auditLog.create({
      data: {
        userId: actorId,
        actorId,
        action,
        module: config.module,
        entityType: config.model,
        entityId:
          record && typeof record === "object" && "id" in record ? String(record.id) : undefined,
        newValue: JSON.parse(JSON.stringify(record)),
      },
    });
  }
}
