import { Controller, Get, Param, Post } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Role } from "../../common/constants/roles.js";
import { CurrentUser } from "../../common/decorators/current-user.decorator.js";
import { Roles } from "../../common/decorators/roles.decorator.js";
import type { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { NotificationService } from "./notification.service.js";

@ApiBearerAuth()
@ApiTags("Notification Management")
@Roles(Role.SUPPORT)
@Controller({ path: "notification-center", version: "1" })
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get("pending")
  @ApiOperation({ summary: "List queued notifications." })
  pending() {
    return this.notificationService.byStatus("queued");
  }

  @Get("sent")
  @ApiOperation({ summary: "List sent notifications." })
  sent() {
    return this.notificationService.byStatus("sent");
  }

  @Get("failed")
  @ApiOperation({ summary: "List failed notifications." })
  failed() {
    return this.notificationService.byStatus("failed");
  }

  @Post(":id/retry")
  @ApiOperation({ summary: "Retry a failed or queued notification." })
  retry(@Param("id") id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.notificationService.retry(id, user.id);
  }
}
