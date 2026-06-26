import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Role } from "../../common/constants/roles.js";
import { CurrentUser } from "../../common/decorators/current-user.decorator.js";
import { Roles } from "../../common/decorators/roles.decorator.js";
import type { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { InventoryItemDto } from "./dto/inventory-item.dto.js";
import { StockAdjustmentDto } from "./dto/stock-adjustment.dto.js";
import { InventoryService } from "./inventory.service.js";

@ApiBearerAuth()
@ApiTags("Inventory")
@Roles(Role.MANAGER)
@Controller({ path: "inventory", version: "1" })
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  @ApiOperation({ summary: "List inventory items with product and variant details." })
  list() {
    return this.inventoryService.list();
  }

  @Get("low-stock")
  @ApiOperation({ summary: "List inventory items at or below reorder level." })
  lowStock() {
    return this.inventoryService.lowStock();
  }

  @Get("out-of-stock")
  @ApiOperation({ summary: "List inventory items with no available stock." })
  outOfStock() {
    return this.inventoryService.outOfStock();
  }

  @Get("movements")
  @ApiOperation({ summary: "List stock movement history, optionally filtered by inventory item." })
  movements(@Query("inventoryItemId") inventoryItemId?: string) {
    return this.inventoryService.movements(inventoryItemId);
  }

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: "Create an inventory item for a product or variant." })
  create(@Body() dto: InventoryItemDto, @CurrentUser() user: AuthenticatedUser) {
    return this.inventoryService.create(dto, user.id);
  }

  @Patch(":id/adjust")
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: "Create a stock adjustment and update inventory balances." })
  adjust(
    @Param("id") id: string,
    @Body() dto: StockAdjustmentDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.inventoryService.adjust(id, dto, user.id);
  }

  @Delete(":id")
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: "Soft delete an inventory item." })
  remove(@Param("id") id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.inventoryService.remove(id, user.id);
  }
}
