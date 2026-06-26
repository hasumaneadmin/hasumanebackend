import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PaginationQueryDto } from "../../common/dto/pagination-query.dto.js";
import { buildPaginationMeta, getPagination } from "../../common/utils/pagination.js";
import { bcrypt } from "../../common/utils/bcrypt.js";
import { PrismaService } from "../../prisma/prisma.service.js";
import { AuditLogService } from "../audit/audit-log.service.js";
import type { CreateUserDto } from "./dto/create-user.dto.js";
import type { UpdateUserDto } from "./dto/update-user.dto.js";

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly auditLogService: AuditLogService,
  ) {}

  async findAll(query: PaginationQueryDto) {
    const { page, limit, skip, take } = getPagination(query);
    const where = {
      deletedAt: null,
      ...(query.search
        ? {
            OR: [
              { name: { contains: query.search, mode: "insensitive" as const } },
              { email: { contains: query.search, mode: "insensitive" as const } },
              { phone: { contains: query.search, mode: "insensitive" as const } },
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
        select: this.safeUserSelect,
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users,
      meta: buildPaginationMeta(page, limit, total),
    };
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findFirst({
      where: { id, deletedAt: null },
      select: {
        ...this.safeUserSelect,
        addresses: true,
        sessions: {
          where: { revokedAt: null, deletedAt: null },
          select: { id: true, ipAddress: true, userAgent: true, expiresAt: true, createdAt: true },
        },
      },
    });
    if (!user) throw new NotFoundException("User not found.");
    return user;
  }

  async create(dto: CreateUserDto, actorId?: string) {
    const existing = await this.prisma.user.findFirst({
      where: { OR: [{ email: dto.email.toLowerCase() }, { phone: dto.phone }] },
    });
    if (existing) throw new BadRequestException("Email or phone already exists.");

    const user = await this.prisma.user.create({
      data: {
        name: dto.name.trim(),
        email: dto.email.toLowerCase().trim(),
        phone: dto.phone,
        role: dto.role,
        passwordHash: dto.password ? await bcrypt.hash(dto.password, this.hashRounds) : undefined,
        createdBy: actorId,
        updatedBy: actorId,
      },
      select: this.safeUserSelect,
    });
    await this.auditLogService.record({
      userId: actorId,
      action: "create",
      module: "users",
      entityType: "user",
      entityId: user.id,
      newValue: user,
    });
    return user;
  }

  async update(id: string, dto: UpdateUserDto, actorId?: string) {
    const existing = await this.ensureExists(id);
    const user = await this.prisma.user.update({
      where: { id },
      data: {
        ...dto,
        email: dto.email?.toLowerCase().trim(),
        passwordHash: dto.password ? await bcrypt.hash(dto.password, this.hashRounds) : undefined,
        updatedBy: actorId,
      },
      select: this.safeUserSelect,
    });
    await this.auditLogService.record({
      userId: actorId,
      action: existing.role !== user.role ? "role_change" : "update",
      module: "users",
      entityType: "user",
      entityId: user.id,
      oldValue: this.safeUser(existing),
      newValue: user,
    });
    return user;
  }

  async block(id: string, actorId?: string) {
    const existing = await this.ensureExists(id);
    const user = await this.prisma.user.update({
      where: { id },
      data: { isBlocked: true, updatedBy: actorId },
      select: this.safeUserSelect,
    });
    await this.auditLogService.record({
      userId: actorId,
      action: "block",
      module: "users",
      entityType: "user",
      entityId: id,
      oldValue: this.safeUser(existing),
      newValue: user,
    });
    return user;
  }

  async unblock(id: string, actorId?: string) {
    const existing = await this.ensureExists(id);
    const user = await this.prisma.user.update({
      where: { id },
      data: { isBlocked: false, updatedBy: actorId },
      select: this.safeUserSelect,
    });
    await this.auditLogService.record({
      userId: actorId,
      action: "unblock",
      module: "users",
      entityType: "user",
      entityId: id,
      oldValue: this.safeUser(existing),
      newValue: user,
    });
    return user;
  }

  async remove(id: string, actorId?: string) {
    const existing = await this.ensureExists(id);
    const user = await this.prisma.user.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        updatedBy: actorId,
        sessions: {
          updateMany: {
            where: { revokedAt: null },
            data: { revokedAt: new Date(), updatedBy: actorId },
          },
        },
      },
      select: this.safeUserSelect,
    });
    await this.auditLogService.record({
      userId: actorId,
      action: "delete",
      module: "users",
      entityType: "user",
      entityId: id,
      oldValue: this.safeUser(existing),
      newValue: user,
    });
    return user;
  }

  private async ensureExists(id: string) {
    const user = await this.prisma.user.findFirst({ where: { id, deletedAt: null } });
    if (!user) throw new NotFoundException("User not found.");
    return user;
  }

  private get hashRounds() {
    return this.configService.get<number>("app.passwordHashRounds") || 12;
  }

  private get safeUserSelect() {
    return {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      isBlocked: true,
      emailVerifiedAt: true,
      twoFactorEnabled: true,
      lastLoginAt: true,
      createdAt: true,
      updatedAt: true,
    };
  }

  private safeUser(user: {
    id: string;
    name: string;
    email?: string | null;
    phone: string;
    role: string;
    isBlocked: boolean;
    emailVerifiedAt?: Date | null;
    twoFactorEnabled: boolean;
    lastLoginAt?: Date | null;
    createdAt: Date;
    updatedAt: Date;
  }) {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      isBlocked: user.isBlocked,
      emailVerifiedAt: user.emailVerifiedAt,
      twoFactorEnabled: user.twoFactorEnabled,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
