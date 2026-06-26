import { Controller, Get, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Role } from "../../common/constants/roles.js";
import { Roles } from "../../common/decorators/roles.decorator.js";
import { AuditLogService } from "./audit-log.service.js";
import { AuditLogQueryDto } from "./dto/audit-log-query.dto.js";

@ApiBearerAuth()
@ApiTags("Audit Logs")
@Roles(Role.ADMIN)
@Controller({ path: "audit-logs", version: "1" })
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Get()
  @ApiOperation({ summary: "Search audit trail events by date, user, action, module, and entity." })
  list(@Query() query: AuditLogQueryDto) {
    return this.auditLogService.list(query);
  }

  @Get("dashboard")
  @ApiOperation({ summary: "Get recent activities, user activity summary, and security events." })
  dashboard(@Query() query: AuditLogQueryDto) {
    return this.auditLogService.dashboard(query);
  }
}
