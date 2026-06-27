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
import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Role } from "../../common/constants/roles.js";
import { CurrentUser } from "../../common/decorators/current-user.decorator.js";
import { Roles } from "../../common/decorators/roles.decorator.js";
import { PaginationQueryDto } from "../../common/dto/pagination-query.dto.js";
import { CreateProductDto, UpdateProductDto } from "../catalog/dto/product.dto.js";
import { AdminService } from "./admin.service.js";
let AdminController = class AdminController {
    adminService;
    constructor(adminService) {
        this.adminService = adminService;
    }
    dashboard() {
        return this.adminService.dashboard();
    }
    users(query) {
        return this.adminService.users(query);
    }
    orders(query) {
        return this.adminService.orders(query);
    }
    updateOrderStatus(id, dto, user) {
        return this.adminService.updateOrderStatus(id, dto.status, user.id);
    }
    products(query) {
        return this.adminService.products(query);
    }
    createProduct(dto, user) {
        return this.adminService.createProduct(dto, user.id);
    }
    updateProduct(id, dto, user) {
        return this.adminService.updateProduct(id, dto, user.id);
    }
    deleteProduct(id, user) {
        return this.adminService.deleteProduct(id, user.id);
    }
    reports() {
        return this.adminService.reports();
    }
    analytics() {
        return this.adminService.analytics();
    }
    logs(query) {
        return this.adminService.logs(query);
    }
};
__decorate([
    Get("dashboard"),
    ApiOperation({ summary: "Get admin dashboard revenue, orders, delivery, and inventory summary." }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "dashboard", null);
__decorate([
    Get("users"),
    ApiOperation({ summary: "List users for admin management." }),
    __param(0, Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [PaginationQueryDto]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "users", null);
__decorate([
    Get("orders"),
    ApiOperation({ summary: "List all orders for admin workflow management." }),
    __param(0, Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [PaginationQueryDto]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "orders", null);
__decorate([
    Patch("orders/:id/status"),
    ApiOperation({ summary: "Update an order's status." }),
    __param(0, Param("id")),
    __param(1, Body()),
    __param(2, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "updateOrderStatus", null);
__decorate([
    Get("products"),
    ApiOperation({ summary: "List products from the admin catalog view." }),
    __param(0, Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [PaginationQueryDto]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "products", null);
__decorate([
    Post("products"),
    Roles(Role.ADMIN),
    ApiOperation({ summary: "Create a product from the admin panel." }),
    __param(0, Body()),
    __param(1, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CreateProductDto, Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "createProduct", null);
__decorate([
    Put("products/:id"),
    Roles(Role.ADMIN),
    ApiOperation({ summary: "Update a product from the admin panel." }),
    __param(0, Param("id")),
    __param(1, Body()),
    __param(2, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, UpdateProductDto, Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "updateProduct", null);
__decorate([
    Delete("products/:id"),
    Roles(Role.ADMIN),
    ApiOperation({ summary: "Soft-delete a product from the admin panel." }),
    __param(0, Param("id")),
    __param(1, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "deleteProduct", null);
__decorate([
    Get("reports"),
    ApiOperation({ summary: "Get revenue, refund, and sales report data." }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "reports", null);
__decorate([
    Get("analytics"),
    ApiOperation({ summary: "Get product, customer, revenue, and activity analytics." }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "analytics", null);
__decorate([
    Get("logs"),
    Roles(Role.ADMIN),
    ApiOperation({ summary: "Get admin audit and login logs." }),
    __param(0, Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [PaginationQueryDto]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "logs", null);
AdminController = __decorate([
    ApiBearerAuth(),
    ApiTags("Admin"),
    Roles(Role.MANAGER),
    Controller({ path: "admin", version: "1" }),
    __metadata("design:paramtypes", [AdminService])
], AdminController);
export { AdminController };
//# sourceMappingURL=admin.controller.js.map