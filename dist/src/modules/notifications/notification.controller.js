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
import { Controller, Get, Param, Post } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Role } from "../../common/constants/roles.js";
import { CurrentUser } from "../../common/decorators/current-user.decorator.js";
import { Roles } from "../../common/decorators/roles.decorator.js";
import { NotificationService } from "./notification.service.js";
let NotificationController = class NotificationController {
    notificationService;
    constructor(notificationService) {
        this.notificationService = notificationService;
    }
    pending() {
        return this.notificationService.byStatus("queued");
    }
    sent() {
        return this.notificationService.byStatus("sent");
    }
    failed() {
        return this.notificationService.byStatus("failed");
    }
    retry(id, user) {
        return this.notificationService.retry(id, user.id);
    }
};
__decorate([
    Get("pending"),
    ApiOperation({ summary: "List queued notifications." }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], NotificationController.prototype, "pending", null);
__decorate([
    Get("sent"),
    ApiOperation({ summary: "List sent notifications." }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], NotificationController.prototype, "sent", null);
__decorate([
    Get("failed"),
    ApiOperation({ summary: "List failed notifications." }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], NotificationController.prototype, "failed", null);
__decorate([
    Post(":id/retry"),
    ApiOperation({ summary: "Retry a failed or queued notification." }),
    __param(0, Param("id")),
    __param(1, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], NotificationController.prototype, "retry", null);
NotificationController = __decorate([
    ApiBearerAuth(),
    ApiTags("Notification Management"),
    Roles(Role.SUPPORT),
    Controller({ path: "notification-center", version: "1" }),
    __metadata("design:paramtypes", [NotificationService])
], NotificationController);
export { NotificationController };
//# sourceMappingURL=notification.controller.js.map