import { Controller, Get, Query, Res } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import type { Response } from "express";
import { Role } from "../../common/constants/roles.js";
import { Roles } from "../../common/decorators/roles.decorator.js";
import { AnalyticsService } from "./analytics.service.js";
import { AnalyticsQueryDto } from "./dto/analytics-query.dto.js";

type AnalyticsKind =
  | "overview"
  | "orders"
  | "subscriptions"
  | "leads"
  | "inventory"
  | "notifications";

@ApiBearerAuth()
@ApiTags("Analytics")
@Roles(Role.MANAGER)
@Controller({ path: "analytics", version: "1" })
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get("overview")
  @ApiOperation({ summary: "Get core SaaS dashboard metrics." })
  overview(@Query() query: AnalyticsQueryDto, @Res({ passthrough: true }) res: Response) {
    return this.respond("overview", query, res);
  }

  @Get("orders")
  @ApiOperation({ summary: "Get order analytics by status, revenue, and recent activity." })
  orders(@Query() query: AnalyticsQueryDto, @Res({ passthrough: true }) res: Response) {
    return this.respond("orders", query, res);
  }

  @Get("subscriptions")
  @ApiOperation({ summary: "Get subscription growth and status analytics." })
  subscriptions(@Query() query: AnalyticsQueryDto, @Res({ passthrough: true }) res: Response) {
    return this.respond("subscriptions", query, res);
  }

  @Get("leads")
  @ApiOperation({ summary: "Get lead volume, source, and conversion analytics." })
  leads(@Query() query: AnalyticsQueryDto, @Res({ passthrough: true }) res: Response) {
    return this.respond("leads", query, res);
  }

  @Get("inventory")
  @ApiOperation({ summary: "Get inventory utilization and low-stock analytics." })
  inventory(@Query() query: AnalyticsQueryDto, @Res({ passthrough: true }) res: Response) {
    return this.respond("inventory", query, res);
  }

  @Get("notifications")
  @ApiOperation({ summary: "Get notification delivery status and success-rate analytics." })
  notifications(@Query() query: AnalyticsQueryDto, @Res({ passthrough: true }) res: Response) {
    return this.respond("notifications", query, res);
  }

  private async respond(kind: AnalyticsKind, query: AnalyticsQueryDto, res: Response) {
    const payload = await this.load(kind, query);
    if (query.format === "csv") {
      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader("Content-Disposition", `attachment; filename=hasumane-${kind}.csv`);
      return this.analyticsService.toCsv(payload);
    }
    if (query.format === "pdf") {
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename=hasumane-${kind}.pdf`);
      return this.analyticsService.toPdf(payload, `HasuMane ${kind} analytics`);
    }
    return payload;
  }

  private load(kind: AnalyticsKind, query: AnalyticsQueryDto) {
    if (kind === "overview") return this.analyticsService.overview(query);
    if (kind === "orders") return this.analyticsService.orders(query);
    if (kind === "subscriptions") return this.analyticsService.subscriptions(query);
    if (kind === "leads") return this.analyticsService.leads(query);
    if (kind === "inventory") return this.analyticsService.inventory();
    return this.analyticsService.notifications(query);
  }
}
