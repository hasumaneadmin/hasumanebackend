import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service.js";
import { AuditLogService } from "../audit/audit-log.service.js";
import type { UpsertPermissionDto } from "./dto/upsert-permission.dto.js";

@Injectable()
export class RbacService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogService: AuditLogService,
  ) {}

  listPermissions() {
    return this.prisma.rolePermission.findMany({
      orderBy: [{ role: "asc" }, { module: "asc" }],
    });
  }

  async upsertPermission(dto: UpsertPermissionDto, actorId?: string) {
    const existing = await this.prisma.rolePermission.findUnique({
      where: {
        role_module: {
          role: dto.role,
          module: dto.module,
        },
      },
    });
    const permission = await this.prisma.rolePermission.upsert({
      where: {
        role_module: {
          role: dto.role,
          module: dto.module,
        },
      },
      update: dto,
      create: dto,
    });
    await this.auditLogService.record({
      userId: actorId,
      action: "permission_change",
      module: "rbac",
      entityType: "role_permission",
      entityId: permission.id,
      oldValue: existing,
      newValue: permission,
    });
    return permission;
  }

  auditLogs(limit = 100) {
    return this.prisma.auditLog.findMany({
      take: Math.min(limit, 500),
      orderBy: { createdAt: "desc" },
    });
  }
}
