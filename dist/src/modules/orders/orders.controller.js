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
import { Body, Controller, Delete, Get, Param, Post, Put, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Role } from "../../common/constants/roles.js";
import { CurrentUser } from "../../common/decorators/current-user.decorator.js";
import { Roles } from "../../common/decorators/roles.decorator.js";
import { PaginationQueryDto } from "../../common/dto/pagination-query.dto.js";
import { AddCartItemDto, RemoveCartItemDto, UpdateCartItemDto } from "./dto/cart.dto.js";
import { CreateOrderDto } from "./dto/create-order.dto.js";
import { OrdersService } from "./orders.service.js";
let OrdersController = class OrdersController {
    ordersService;
    constructor(ordersService) {
        this.ordersService = ordersService;
    }
    create(user, dto) {
        return this.ordersService.createOrder(user.id, dto);
    }
    list(user, query) {
        return this.ordersService.listOrders(user.id, query);
    }
    get(user, id) {
        return this.ordersService.getOrder(user.id, id);
    }
    cancel(user, id) {
        return this.ordersService.cancelOrder(user.id, id);
    }
};
__decorate([
    Post(),
    ApiOperation({ summary: "Create an order from explicit items or the active cart." }),
    __param(0, CurrentUser()),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, CreateOrderDto]),
    __metadata("design:returntype", void 0)
], OrdersController.prototype, "create", null);
__decorate([
    Get(),
    ApiOperation({ summary: "List the authenticated user's orders." }),
    __param(0, CurrentUser()),
    __param(1, Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, PaginationQueryDto]),
    __metadata("design:returntype", void 0)
], OrdersController.prototype, "list", null);
__decorate([
    Get(":id"),
    ApiOperation({ summary: "Get one authenticated user order." }),
    __param(0, CurrentUser()),
    __param(1, Param("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], OrdersController.prototype, "get", null);
__decorate([
    Put(":id/cancel"),
    ApiOperation({ summary: "Cancel a pending or processing order." }),
    __param(0, CurrentUser()),
    __param(1, Param("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], OrdersController.prototype, "cancel", null);
OrdersController = __decorate([
    ApiBearerAuth(),
    ApiTags("Orders"),
    Roles(Role.CUSTOMER),
    Controller({ path: "orders", version: "1" }),
    __metadata("design:paramtypes", [OrdersService])
], OrdersController);
export { OrdersController };
let CartController = class CartController {
    ordersService;
    constructor(ordersService) {
        this.ordersService = ordersService;
    }
    get(user) {
        return this.ordersService.getCart(user.id);
    }
    add(user, dto) {
        return this.ordersService.addToCart(user.id, dto);
    }
    update(user, dto) {
        return this.ordersService.updateCartItem(user.id, dto);
    }
    remove(user, dto) {
        return this.ordersService.removeCartItem(user.id, dto.itemId);
    }
};
__decorate([
    Get(),
    ApiOperation({ summary: "Get the authenticated user's active cart." }),
    __param(0, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CartController.prototype, "get", null);
__decorate([
    Post("add"),
    ApiOperation({ summary: "Add a product or variant to the active cart." }),
    __param(0, CurrentUser()),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, AddCartItemDto]),
    __metadata("design:returntype", void 0)
], CartController.prototype, "add", null);
__decorate([
    Put("update"),
    ApiOperation({ summary: "Update active cart item quantity." }),
    __param(0, CurrentUser()),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, UpdateCartItemDto]),
    __metadata("design:returntype", void 0)
], CartController.prototype, "update", null);
__decorate([
    Delete("remove"),
    ApiOperation({ summary: "Remove an item from the active cart." }),
    __param(0, CurrentUser()),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, RemoveCartItemDto]),
    __metadata("design:returntype", void 0)
], CartController.prototype, "remove", null);
CartController = __decorate([
    ApiBearerAuth(),
    ApiTags("Cart"),
    Roles(Role.CUSTOMER),
    Controller({ path: "cart", version: "1" }),
    __metadata("design:paramtypes", [OrdersService])
], CartController);
export { CartController };
//# sourceMappingURL=orders.controller.js.map