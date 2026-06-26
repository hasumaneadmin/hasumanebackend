import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Role } from "../../common/constants/roles.js";
import { CurrentUser } from "../../common/decorators/current-user.decorator.js";
import { Public } from "../../common/decorators/public.decorator.js";
import { Roles } from "../../common/decorators/roles.decorator.js";
import type {
  AuthenticatedRequest,
  AuthenticatedUser,
} from "../../common/types/authenticated-request.js";
import { OperationsService } from "./operations.service.js";

type Payload = Record<string, unknown>;

@ApiTags("Public Leads")
@Controller({ path: "leads", version: "1" })
export class LeadsController {
  constructor(private readonly operationsService: OperationsService) {}

  @Public()
  @Post()
  @ApiOperation({ summary: "Capture a public website lead." })
  capture(@Body() payload: Payload, @Req() request: AuthenticatedRequest) {
    return this.operationsService.captureLead(payload, request);
  }
}

@ApiBearerAuth()
@ApiTags("Admin Summary")
@Roles(Role.MANAGER)
@Controller({ path: "admin", version: "1" })
export class AdminSummaryController {
  constructor(private readonly operationsService: OperationsService) {}

  @Get("summary")
  summary() {
    return this.operationsService.summary();
  }

  @Get("leads")
  leads() {
    return this.operationsService.leads();
  }

  @Delete("leads/:id")
  @ApiOperation({ summary: "Delete one captured lead and its linked subscription when present." })
  removeLead(@Param("id") id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.operationsService.deleteLead(id, user.id);
  }
}

@ApiBearerAuth()
@ApiTags("Subscriptions")
@Roles(Role.MANAGER)
@Controller({ path: "subscriptions", version: "1" })
export class SubscriptionsController {
  constructor(private readonly operationsService: OperationsService) {}

  @Public()
  @Post("public")
  @ApiOperation({ summary: "Capture a public subscription request." })
  capturePublic(@Body() payload: Payload, @Req() request: AuthenticatedRequest) {
    return this.operationsService.captureLead(payload, request);
  }

  @Get()
  list() {
    return this.operationsService.subscriptions();
  }

  @Post()
  create(@Body() payload: Payload, @CurrentUser() user: AuthenticatedUser) {
    return this.operationsService.createSubscription(payload, user.id);
  }

  @Patch(":id/status")
  updateStatus(
    @Param("id") id: string,
    @Body() payload: Payload,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.operationsService.updateSubscriptionStatus(
      id,
      String(payload.status || ""),
      user.id,
    );
  }

  @Patch(":id/pause")
  pause(@Param("id") id: string, @Body() payload: Payload, @CurrentUser() user: AuthenticatedUser) {
    return this.operationsService.pauseSubscription(id, String(payload.pauseUntil || ""), user.id);
  }

  @Patch(":id/resume")
  resume(@Param("id") id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.operationsService.resumeSubscription(id, user.id);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete one subscription and its related daily orders." })
  remove(@Param("id") id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.operationsService.deleteSubscription(id, user.id);
  }
}

@ApiBearerAuth()
@ApiTags("Dispatch")
@Roles(Role.MANAGER)
@Controller({ path: "dispatch", version: "1" })
export class DispatchController {
  constructor(private readonly operationsService: OperationsService) {}

  @Post("run")
  run(@Body() payload: Payload, @CurrentUser() user: AuthenticatedUser) {
    const date = typeof payload.date === "string" ? payload.date : undefined;
    return this.operationsService.runDispatch(date, user.id);
  }

  @Get("orders")
  orders() {
    return this.operationsService.orders();
  }

  @Patch("orders/:id/deliver")
  deliver(
    @Param("id") id: string,
    @Body() payload: Payload,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.operationsService.markDelivered(id, payload, user.id);
  }
}

@ApiBearerAuth()
@ApiTags("Procurement")
@Roles(Role.MANAGER)
@Controller({ path: "farmers", version: "1" })
export class FarmersController {
  constructor(private readonly operationsService: OperationsService) {}

  @Get()
  list() {
    return this.operationsService.farmers();
  }

  @Post()
  create(@Body() payload: Payload, @CurrentUser() user: AuthenticatedUser) {
    return this.operationsService.createFarmer(payload, user.id);
  }

  @Get(":id/payouts")
  payouts(@Param("id") id: string) {
    return this.operationsService.procurementLogs(id);
  }
}

@ApiBearerAuth()
@ApiTags("Procurement")
@Roles(Role.MANAGER)
@Controller({ path: "procurement", version: "1" })
export class ProcurementController {
  constructor(private readonly operationsService: OperationsService) {}

  @Get("logs")
  logs(@Query("farmerId") farmerId?: string) {
    return this.operationsService.procurementLogs(farmerId);
  }

  @Post("logs")
  create(@Body() payload: Payload, @CurrentUser() user: AuthenticatedUser) {
    return this.operationsService.createProcurementLog(payload, user.id);
  }
}

@ApiBearerAuth()
@ApiTags("Notifications")
@Roles(Role.SUPPORT)
@Controller({ path: "notifications", version: "1" })
export class NotificationsController {
  constructor(private readonly operationsService: OperationsService) {}

  @Get()
  list() {
    return this.operationsService.notifications();
  }

  @Post("enqueue")
  enqueue(@Body() payload: Payload, @CurrentUser() user: AuthenticatedUser) {
    return this.operationsService.enqueueNotification(payload, user.id);
  }
}

@ApiBearerAuth()
@ApiTags("Settings")
@Roles(Role.ADMIN)
@Controller({ path: "settings", version: "1" })
export class SettingsController {
  constructor(private readonly operationsService: OperationsService) {}

  @Get()
  list() {
    return this.operationsService.settings();
  }

  @Put(":key")
  save(
    @Param("key") key: string,
    @Body() payload: Payload,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.operationsService.saveSetting(key, payload, user.id);
  }
}

@ApiBearerAuth()
@ApiTags("Security")
@Roles(Role.ADMIN)
@Controller({ path: "security", version: "1" })
export class SecurityController {
  constructor(private readonly operationsService: OperationsService) {}

  @Get("audit-logs")
  auditLogs() {
    return this.operationsService.auditLogs();
  }

  @Get("login-history")
  loginHistory() {
    return this.operationsService.loginHistory();
  }
}

@ApiBearerAuth()
@ApiTags("RBAC")
@Roles(Role.ADMIN)
@Controller({ path: "roles", version: "1" })
export class RolePermissionsController {
  constructor(private readonly operationsService: OperationsService) {}

  @Get("permissions")
  permissions() {
    return this.operationsService.rolePermissions();
  }
}
