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
import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, Req, } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Role } from "../../common/constants/roles.js";
import { CurrentUser } from "../../common/decorators/current-user.decorator.js";
import { Public } from "../../common/decorators/public.decorator.js";
import { Roles } from "../../common/decorators/roles.decorator.js";
import { OperationsService } from "./operations.service.js";
let LeadsController = class LeadsController {
    operationsService;
    constructor(operationsService) {
        this.operationsService = operationsService;
    }
    capture(payload, request) {
        return this.operationsService.captureLead(payload, request);
    }
};
__decorate([
    Public(),
    Post(),
    ApiOperation({ summary: "Capture a public website lead." }),
    __param(0, Body()),
    __param(1, Req()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], LeadsController.prototype, "capture", null);
LeadsController = __decorate([
    ApiTags("Public Leads"),
    Controller({ path: "leads", version: "1" }),
    __metadata("design:paramtypes", [OperationsService])
], LeadsController);
export { LeadsController };
let AdminSummaryController = class AdminSummaryController {
    operationsService;
    constructor(operationsService) {
        this.operationsService = operationsService;
    }
    summary() {
        return this.operationsService.summary();
    }
    leads() {
        return this.operationsService.leads();
    }
    removeLead(id, user) {
        return this.operationsService.deleteLead(id, user.id);
    }
};
__decorate([
    Get("summary"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminSummaryController.prototype, "summary", null);
__decorate([
    Get("leads"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminSummaryController.prototype, "leads", null);
__decorate([
    Delete("leads/:id"),
    ApiOperation({ summary: "Delete one captured lead and its linked subscription when present." }),
    __param(0, Param("id")),
    __param(1, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AdminSummaryController.prototype, "removeLead", null);
AdminSummaryController = __decorate([
    ApiBearerAuth(),
    ApiTags("Admin Summary"),
    Roles(Role.MANAGER),
    Controller({ path: "admin", version: "1" }),
    __metadata("design:paramtypes", [OperationsService])
], AdminSummaryController);
export { AdminSummaryController };
let SubscriptionsController = class SubscriptionsController {
    operationsService;
    constructor(operationsService) {
        this.operationsService = operationsService;
    }
    capturePublic(payload, request) {
        return this.operationsService.captureLead(payload, request);
    }
    list() {
        return this.operationsService.subscriptions();
    }
    create(payload, user) {
        return this.operationsService.createSubscription(payload, user.id);
    }
    updateStatus(id, payload, user) {
        return this.operationsService.updateSubscriptionStatus(id, String(payload.status || ""), user.id);
    }
    pause(id, payload, user) {
        return this.operationsService.pauseSubscription(id, String(payload.pauseUntil || ""), user.id);
    }
    resume(id, user) {
        return this.operationsService.resumeSubscription(id, user.id);
    }
    remove(id, user) {
        return this.operationsService.deleteSubscription(id, user.id);
    }
};
__decorate([
    Public(),
    Post("public"),
    ApiOperation({ summary: "Capture a public subscription request." }),
    __param(0, Body()),
    __param(1, Req()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], SubscriptionsController.prototype, "capturePublic", null);
__decorate([
    Get(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SubscriptionsController.prototype, "list", null);
__decorate([
    Post(),
    __param(0, Body()),
    __param(1, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], SubscriptionsController.prototype, "create", null);
__decorate([
    Patch(":id/status"),
    __param(0, Param("id")),
    __param(1, Body()),
    __param(2, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], SubscriptionsController.prototype, "updateStatus", null);
__decorate([
    Patch(":id/pause"),
    __param(0, Param("id")),
    __param(1, Body()),
    __param(2, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], SubscriptionsController.prototype, "pause", null);
__decorate([
    Patch(":id/resume"),
    __param(0, Param("id")),
    __param(1, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], SubscriptionsController.prototype, "resume", null);
__decorate([
    Delete(":id"),
    ApiOperation({ summary: "Delete one subscription and its related daily orders." }),
    __param(0, Param("id")),
    __param(1, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], SubscriptionsController.prototype, "remove", null);
SubscriptionsController = __decorate([
    ApiBearerAuth(),
    ApiTags("Subscriptions"),
    Roles(Role.MANAGER),
    Controller({ path: "subscriptions", version: "1" }),
    __metadata("design:paramtypes", [OperationsService])
], SubscriptionsController);
export { SubscriptionsController };
let DispatchController = class DispatchController {
    operationsService;
    constructor(operationsService) {
        this.operationsService = operationsService;
    }
    run(payload, user) {
        const date = typeof payload.date === "string" ? payload.date : undefined;
        return this.operationsService.runDispatch(date, user.id);
    }
    orders() {
        return this.operationsService.orders();
    }
    deliver(id, payload, user) {
        return this.operationsService.markDelivered(id, payload, user.id);
    }
};
__decorate([
    Post("run"),
    __param(0, Body()),
    __param(1, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], DispatchController.prototype, "run", null);
__decorate([
    Get("orders"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], DispatchController.prototype, "orders", null);
__decorate([
    Patch("orders/:id/deliver"),
    __param(0, Param("id")),
    __param(1, Body()),
    __param(2, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], DispatchController.prototype, "deliver", null);
DispatchController = __decorate([
    ApiBearerAuth(),
    ApiTags("Dispatch"),
    Roles(Role.MANAGER),
    Controller({ path: "dispatch", version: "1" }),
    __metadata("design:paramtypes", [OperationsService])
], DispatchController);
export { DispatchController };
let FarmersController = class FarmersController {
    operationsService;
    constructor(operationsService) {
        this.operationsService = operationsService;
    }
    list() {
        return this.operationsService.farmers();
    }
    create(payload, user) {
        return this.operationsService.createFarmer(payload, user.id);
    }
    payouts(id) {
        return this.operationsService.procurementLogs(id);
    }
};
__decorate([
    Get(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], FarmersController.prototype, "list", null);
__decorate([
    Post(),
    __param(0, Body()),
    __param(1, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], FarmersController.prototype, "create", null);
__decorate([
    Get(":id/payouts"),
    __param(0, Param("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], FarmersController.prototype, "payouts", null);
FarmersController = __decorate([
    ApiBearerAuth(),
    ApiTags("Procurement"),
    Roles(Role.MANAGER),
    Controller({ path: "farmers", version: "1" }),
    __metadata("design:paramtypes", [OperationsService])
], FarmersController);
export { FarmersController };
let ProcurementController = class ProcurementController {
    operationsService;
    constructor(operationsService) {
        this.operationsService = operationsService;
    }
    logs(farmerId) {
        return this.operationsService.procurementLogs(farmerId);
    }
    create(payload, user) {
        return this.operationsService.createProcurementLog(payload, user.id);
    }
};
__decorate([
    Get("logs"),
    __param(0, Query("farmerId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ProcurementController.prototype, "logs", null);
__decorate([
    Post("logs"),
    __param(0, Body()),
    __param(1, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], ProcurementController.prototype, "create", null);
ProcurementController = __decorate([
    ApiBearerAuth(),
    ApiTags("Procurement"),
    Roles(Role.MANAGER),
    Controller({ path: "procurement", version: "1" }),
    __metadata("design:paramtypes", [OperationsService])
], ProcurementController);
export { ProcurementController };
let NotificationsController = class NotificationsController {
    operationsService;
    constructor(operationsService) {
        this.operationsService = operationsService;
    }
    list() {
        return this.operationsService.notifications();
    }
    enqueue(payload, user) {
        return this.operationsService.enqueueNotification(payload, user.id);
    }
};
__decorate([
    Get(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], NotificationsController.prototype, "list", null);
__decorate([
    Post("enqueue"),
    __param(0, Body()),
    __param(1, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], NotificationsController.prototype, "enqueue", null);
NotificationsController = __decorate([
    ApiBearerAuth(),
    ApiTags("Notifications"),
    Roles(Role.SUPPORT),
    Controller({ path: "notifications", version: "1" }),
    __metadata("design:paramtypes", [OperationsService])
], NotificationsController);
export { NotificationsController };
let SettingsController = class SettingsController {
    operationsService;
    constructor(operationsService) {
        this.operationsService = operationsService;
    }
    list() {
        return this.operationsService.settings();
    }
    save(key, payload, user) {
        return this.operationsService.saveSetting(key, payload, user.id);
    }
};
__decorate([
    Get(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SettingsController.prototype, "list", null);
__decorate([
    Put(":key"),
    __param(0, Param("key")),
    __param(1, Body()),
    __param(2, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], SettingsController.prototype, "save", null);
SettingsController = __decorate([
    ApiBearerAuth(),
    ApiTags("Settings"),
    Roles(Role.ADMIN),
    Controller({ path: "settings", version: "1" }),
    __metadata("design:paramtypes", [OperationsService])
], SettingsController);
export { SettingsController };
let SecurityController = class SecurityController {
    operationsService;
    constructor(operationsService) {
        this.operationsService = operationsService;
    }
    auditLogs() {
        return this.operationsService.auditLogs();
    }
    loginHistory() {
        return this.operationsService.loginHistory();
    }
};
__decorate([
    Get("audit-logs"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SecurityController.prototype, "auditLogs", null);
__decorate([
    Get("login-history"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SecurityController.prototype, "loginHistory", null);
SecurityController = __decorate([
    ApiBearerAuth(),
    ApiTags("Security"),
    Roles(Role.ADMIN),
    Controller({ path: "security", version: "1" }),
    __metadata("design:paramtypes", [OperationsService])
], SecurityController);
export { SecurityController };
let RolePermissionsController = class RolePermissionsController {
    operationsService;
    constructor(operationsService) {
        this.operationsService = operationsService;
    }
    permissions() {
        return this.operationsService.rolePermissions();
    }
};
__decorate([
    Get("permissions"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], RolePermissionsController.prototype, "permissions", null);
RolePermissionsController = __decorate([
    ApiBearerAuth(),
    ApiTags("RBAC"),
    Roles(Role.ADMIN),
    Controller({ path: "roles", version: "1" }),
    __metadata("design:paramtypes", [OperationsService])
], RolePermissionsController);
export { RolePermissionsController };
//# sourceMappingURL=operations.controller.js.map