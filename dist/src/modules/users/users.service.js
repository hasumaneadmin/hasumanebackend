var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { buildPaginationMeta, getPagination } from "../../common/utils/pagination.js";
import { bcrypt } from "../../common/utils/bcrypt.js";
import { PrismaService } from "../../prisma/prisma.service.js";
import { AuditLogService } from "../audit/audit-log.service.js";
let UsersService = class UsersService {
    prisma;
    configService;
    auditLogService;
    constructor(prisma, configService, auditLogService) {
        this.prisma = prisma;
        this.configService = configService;
        this.auditLogService = auditLogService;
    }
    async findAll(query) {
        const { page, limit, skip, take } = getPagination(query);
        const where = {
            deletedAt: null,
            ...(query.search
                ? {
                    OR: [
                        { name: { contains: query.search, mode: "insensitive" } },
                        { email: { contains: query.search, mode: "insensitive" } },
                        { phone: { contains: query.search, mode: "insensitive" } },
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
    async findOne(id) {
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
        if (!user)
            throw new NotFoundException("User not found.");
        return user;
    }
    async create(dto, actorId) {
        const existing = await this.prisma.user.findFirst({
            where: { OR: [{ email: dto.email.toLowerCase() }, { phone: dto.phone }] },
        });
        if (existing)
            throw new BadRequestException("Email or phone already exists.");
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
    async update(id, dto, actorId) {
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
    async block(id, actorId) {
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
    async unblock(id, actorId) {
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
    async remove(id, actorId) {
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
    async ensureExists(id) {
        const user = await this.prisma.user.findFirst({ where: { id, deletedAt: null } });
        if (!user)
            throw new NotFoundException("User not found.");
        return user;
    }
    get hashRounds() {
        return this.configService.get("app.passwordHashRounds") || 12;
    }
    get safeUserSelect() {
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
    safeUser(user) {
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
};
UsersService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService,
        ConfigService,
        AuditLogService])
], UsersService);
export { UsersService };
//# sourceMappingURL=users.service.js.map