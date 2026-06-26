import { Body, Controller, Get, Post, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Role } from "../../common/constants/roles.js";
import { CurrentUser } from "../../common/decorators/current-user.decorator.js";
import { Roles } from "../../common/decorators/roles.decorator.js";
import type { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { UpsertPermissionDto } from "./dto/upsert-permission.dto.js";
import { RbacService } from "./rbac.service.js";

@ApiTags("Roles & Permissions")
@ApiBearerAuth()
@Controller({ path: "rbac", version: "1" })
@Roles(Role.ADMIN)
export class RbacController {
  constructor(private readonly rbacService: RbacService) {}

  @Get("permissions")
  @ApiOperation({ summary: "List RBAC permission rows." })
  listPermissions() {
    return this.rbacService.listPermissions();
  }

  @Post("permissions")
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: "Create or update one RBAC permission row." })
  upsertPermission(@Body() dto: UpsertPermissionDto, @CurrentUser() user: AuthenticatedUser) {
    return this.rbacService.upsertPermission(dto, user.id);
  }

  @Get("audit-logs")
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: "Read audit logs for privileged operations." })
  auditLogs(@Query("limit") limit?: string) {
    return this.rbacService.auditLogs(Number(limit || 100));
  }
}
