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
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Role } from "../../common/constants/roles.js";
import { CurrentUser } from "../../common/decorators/current-user.decorator.js";
import { Roles } from "../../common/decorators/roles.decorator.js";
import { InventoryItemDto } from "./dto/inventory-item.dto.js";
import { StockAdjustmentDto } from "./dto/stock-adjustment.dto.js";
import { InventoryService } from "./inventory.service.js";
let InventoryController = class InventoryController {
    inventoryService;
    constructor(inventoryService) {
        this.inventoryService = inventoryService;
    }
    list() {
        return this.inventoryService.list();
    }
    lowStock() {
        return this.inventoryService.lowStock();
    }
    outOfStock() {
        return this.inventoryService.outOfStock();
    }
    movements(inventoryItemId) {
        return this.inventoryService.movements(inventoryItemId);
    }
    create(dto, user) {
        return this.inventoryService.create(dto, user.id);
    }
    adjust(id, dto, user) {
        return this.inventoryService.adjust(id, dto, user.id);
    }
    remove(id, user) {
        return this.inventoryService.remove(id, user.id);
    }
};
__decorate([
    Get(),
    ApiOperation({ summary: "List inventory items with product and variant details." }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], InventoryController.prototype, "list", null);
__decorate([
    Get("low-stock"),
    ApiOperation({ summary: "List inventory items at or below reorder level." }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], InventoryController.prototype, "lowStock", null);
__decorate([
    Get("out-of-stock"),
    ApiOperation({ summary: "List inventory items with no available stock." }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], InventoryController.prototype, "outOfStock", null);
__decorate([
    Get("movements"),
    ApiOperation({ summary: "List stock movement history, optionally filtered by inventory item." }),
    __param(0, Query("inventoryItemId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], InventoryController.prototype, "movements", null);
__decorate([
    Post(),
    Roles(Role.ADMIN),
    ApiOperation({ summary: "Create an inventory item for a product or variant." }),
    __param(0, Body()),
    __param(1, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [InventoryItemDto, Object]),
    __metadata("design:returntype", void 0)
], InventoryController.prototype, "create", null);
__decorate([
    Patch(":id/adjust"),
    Roles(Role.ADMIN),
    ApiOperation({ summary: "Create a stock adjustment and update inventory balances." }),
    __param(0, Param("id")),
    __param(1, Body()),
    __param(2, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, StockAdjustmentDto, Object]),
    __metadata("design:returntype", void 0)
], InventoryController.prototype, "adjust", null);
__decorate([
    Delete(":id"),
    Roles(Role.ADMIN),
    ApiOperation({ summary: "Soft delete an inventory item." }),
    __param(0, Param("id")),
    __param(1, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], InventoryController.prototype, "remove", null);
InventoryController = __decorate([
    ApiBearerAuth(),
    ApiTags("Inventory"),
    Roles(Role.MANAGER),
    Controller({ path: "inventory", version: "1" }),
    __metadata("design:paramtypes", [InventoryService])
], InventoryController);
export { InventoryController };
//# sourceMappingURL=inventory.controller.js.map