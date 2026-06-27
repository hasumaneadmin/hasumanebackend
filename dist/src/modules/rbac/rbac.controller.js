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
import { Body, Controller, Get, Post, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Role } from "../../common/constants/roles.js";
import { CurrentUser } from "../../common/decorators/current-user.decorator.js";
import { Roles } from "../../common/decorators/roles.decorator.js";
import { UpsertPermissionDto } from "./dto/upsert-permission.dto.js";
import { RbacService } from "./rbac.service.js";
let RbacController = class RbacController {
    rbacService;
    constructor(rbacService) {
        this.rbacService = rbacService;
    }
    listPermissions() {
        return this.rbacService.listPermissions();
    }
    upsertPermission(dto, user) {
        return this.rbacService.upsertPermission(dto, user.id);
    }
    auditLogs(limit) {
        return this.rbacService.auditLogs(Number(limit || 100));
    }
};
__decorate([
    Get("permissions"),
    ApiOperation({ summary: "List RBAC permission rows." }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], RbacController.prototype, "listPermissions", null);
__decorate([
    Post("permissions"),
    Roles(Role.SUPER_ADMIN),
    ApiOperation({ summary: "Create or update one RBAC permission row." }),
    __param(0, Body()),
    __param(1, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [UpsertPermissionDto, Object]),
    __metadata("design:returntype", void 0)
], RbacController.prototype, "upsertPermission", null);
__decorate([
    Get("audit-logs"),
    Roles(Role.SUPER_ADMIN),
    ApiOperation({ summary: "Read audit logs for privileged operations." }),
    __param(0, Query("limit")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RbacController.prototype, "auditLogs", null);
RbacController = __decorate([
    ApiTags("Roles & Permissions"),
    ApiBearerAuth(),
    Controller({ path: "rbac", version: "1" }),
    Roles(Role.ADMIN),
    __metadata("design:paramtypes", [RbacService])
], RbacController);
export { RbacController };
//# sourceMappingURL=rbac.controller.js.map