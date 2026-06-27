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
import { Controller, Get, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Role } from "../../common/constants/roles.js";
import { Roles } from "../../common/decorators/roles.decorator.js";
import { AuditLogService } from "./audit-log.service.js";
import { AuditLogQueryDto } from "./dto/audit-log-query.dto.js";
let AuditLogController = class AuditLogController {
    auditLogService;
    constructor(auditLogService) {
        this.auditLogService = auditLogService;
    }
    list(query) {
        return this.auditLogService.list(query);
    }
    dashboard(query) {
        return this.auditLogService.dashboard(query);
    }
};
__decorate([
    Get(),
    ApiOperation({ summary: "Search audit trail events by date, user, action, module, and entity." }),
    __param(0, Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [AuditLogQueryDto]),
    __metadata("design:returntype", void 0)
], AuditLogController.prototype, "list", null);
__decorate([
    Get("dashboard"),
    ApiOperation({ summary: "Get recent activities, user activity summary, and security events." }),
    __param(0, Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [AuditLogQueryDto]),
    __metadata("design:returntype", void 0)
], AuditLogController.prototype, "dashboard", null);
AuditLogController = __decorate([
    ApiBearerAuth(),
    ApiTags("Audit Logs"),
    Roles(Role.ADMIN),
    Controller({ path: "audit-logs", version: "1" }),
    __metadata("design:paramtypes", [AuditLogService])
], AuditLogController);
export { AuditLogController };
//# sourceMappingURL=audit-log.controller.js.map