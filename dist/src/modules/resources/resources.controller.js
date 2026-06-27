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
import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from "@nestjs/swagger";
import { Role } from "../../common/constants/roles.js";
import { CurrentUser } from "../../common/decorators/current-user.decorator.js";
import { Roles } from "../../common/decorators/roles.decorator.js";
import { PaginationQueryDto } from "../../common/dto/pagination-query.dto.js";
import { ResourceWriteDto } from "./dto/resource-write.dto.js";
import { RESOURCE_KEYS } from "./resource-registry.js";
import { ResourcesService } from "./resources.service.js";
let ResourcesController = class ResourcesController {
    resourcesService;
    constructor(resourcesService) {
        this.resourcesService = resourcesService;
    }
    list(resource, query, user) {
        return this.resourcesService.list(resource, query, user);
    }
    findOne(resource, id, user) {
        return this.resourcesService.findOne(resource, id, user);
    }
    create(resource, dto, user) {
        return this.resourcesService.create(resource, dto.data, user);
    }
    update(resource, id, dto, user) {
        return this.resourcesService.update(resource, id, dto.data, user);
    }
    remove(resource, id, user) {
        return this.resourcesService.remove(resource, id, user);
    }
};
__decorate([
    Get(),
    ApiOperation({ summary: "List a production resource with pagination/search/sort/filter." }),
    ApiParam({ name: "resource", enum: RESOURCE_KEYS }),
    __param(0, Param("resource")),
    __param(1, Query()),
    __param(2, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, PaginationQueryDto, Object]),
    __metadata("design:returntype", void 0)
], ResourcesController.prototype, "list", null);
__decorate([
    Get(":id"),
    ApiOperation({ summary: "Read one resource record." }),
    __param(0, Param("resource")),
    __param(1, Param("id")),
    __param(2, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], ResourcesController.prototype, "findOne", null);
__decorate([
    Post(),
    ApiOperation({ summary: "Create one resource record." }),
    __param(0, Param("resource")),
    __param(1, Body()),
    __param(2, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, ResourceWriteDto, Object]),
    __metadata("design:returntype", void 0)
], ResourcesController.prototype, "create", null);
__decorate([
    Patch(":id"),
    ApiOperation({ summary: "Update one resource record." }),
    __param(0, Param("resource")),
    __param(1, Param("id")),
    __param(2, Body()),
    __param(3, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, ResourceWriteDto, Object]),
    __metadata("design:returntype", void 0)
], ResourcesController.prototype, "update", null);
__decorate([
    Delete(":id"),
    ApiOperation({ summary: "Soft delete one resource record when supported." }),
    __param(0, Param("resource")),
    __param(1, Param("id")),
    __param(2, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], ResourcesController.prototype, "remove", null);
ResourcesController = __decorate([
    ApiTags("Domain Resources"),
    ApiBearerAuth(),
    Controller({ path: "resources/:resource", version: "1" }),
    Roles(Role.CUSTOMER),
    __metadata("design:paramtypes", [ResourcesService])
], ResourcesController);
export { ResourcesController };
//# sourceMappingURL=resources.controller.js.map