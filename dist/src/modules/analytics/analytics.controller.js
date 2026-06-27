var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { Controller, Get, Query, Res } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Role } from "../../common/constants/roles.js";
import { Roles } from "../../common/decorators/roles.decorator.js";
import { AnalyticsService } from "./analytics.service.js";
import { AnalyticsQueryDto } from "./dto/analytics-query.dto.js";
let AnalyticsController = class AnalyticsController {
    analyticsService;
    constructor(analyticsService) {
        this.analyticsService = analyticsService;
    }
    overview(query, res) {
        return this.respond("overview", query, res);
    }
    orders(query, res) {
        return this.respond("orders", query, res);
    }
    subscriptions(query, res) {
        return this.respond("subscriptions", query, res);
    }
    leads(query, res) {
        return this.respond("leads", query, res);
    }
    inventory(query, res) {
        return this.respond("inventory", query, res);
    }
    notifications(query, res) {
        return this.respond("notifications", query, res);
    }
    async respond(kind, query, res) {
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
    load(kind, query) {
        if (kind === "overview")
            return this.analyticsService.overview(query);
        if (kind === "orders")
            return this.analyticsService.orders(query);
        if (kind === "subscriptions")
            return this.analyticsService.subscriptions(query);
        if (kind === "leads")
            return this.analyticsService.leads(query);
        if (kind === "inventory")
            return this.analyticsService.inventory();
        return this.analyticsService.notifications(query);
    }
};
__decorate([
    Get("overview"),
    ApiOperation({ summary: "Get core SaaS dashboard metrics." }),
    __param(0, Query()),
    __param(1, Res({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [AnalyticsQueryDto, Object]),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "overview", null);
__decorate([
    Get("orders"),
    ApiOperation({ summary: "Get order analytics by status, revenue, and recent activity." }),
    __param(0, Query()),
    __param(1, Res({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [AnalyticsQueryDto, Object]),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "orders", null);
__decorate([
    Get("subscriptions"),
    ApiOperation({ summary: "Get subscription growth and status analytics." }),
    __param(0, Query()),
    __param(1, Res({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [AnalyticsQueryDto, Object]),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "subscriptions", null);
__decorate([
    Get("leads"),
    ApiOperation({ summary: "Get lead volume, source, and conversion analytics." }),
    __param(0, Query()),
    __param(1, Res({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [AnalyticsQueryDto, Object]),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "leads", null);
__decorate([
    Get("inventory"),
    ApiOperation({ summary: "Get inventory utilization and low-stock analytics." }),
    __param(0, Query()),
    __param(1, Res({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [AnalyticsQueryDto, Object]),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "inventory", null);
__decorate([
    Get("notifications"),
    ApiOperation({ summary: "Get notification delivery status and success-rate analytics." }),
    __param(0, Query()),
    __param(1, Res({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [AnalyticsQueryDto, Object]),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "notifications", null);
AnalyticsController = __decorate([
    ApiBearerAuth(),
    ApiTags("Analytics"),
    Roles(Role.MANAGER),
    Controller({ path: "analytics", version: "1" }),
    __metadata("design:paramtypes", [AnalyticsService])
], AnalyticsController);
export { AnalyticsController };
//# sourceMappingURL=analytics.controller.js.map