import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Role } from "../../common/constants/roles.js";
import { CurrentUser } from "../../common/decorators/current-user.decorator.js";
import { Roles } from "../../common/decorators/roles.decorator.js";
import { PaginationQueryDto } from "../../common/dto/pagination-query.dto.js";
import type { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { CreateProductDto, UpdateProductDto } from "../catalog/dto/product.dto.js";
import { AdminService } from "./admin.service.js";

@ApiBearerAuth()
@ApiTags("Admin")
@Roles(Role.MANAGER)
@Controller({ path: "admin", version: "1" })
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get("dashboard")
  @ApiOperation({ summary: "Get admin dashboard revenue, orders, delivery, and inventory summary." })
  dashboard() {
    return this.adminService.dashboard();
  }

  @Get("users")
  @ApiOperation({ summary: "List users for admin management." })
  users(@Query() query: PaginationQueryDto) {
    return this.adminService.users(query);
  }

  @Get("orders")
  @ApiOperation({ summary: "List all orders for admin workflow management." })
  orders(@Query() query: PaginationQueryDto) {
    return this.adminService.orders(query);
  }

  @Patch("orders/:id/status")
  @ApiOperation({ summary: "Update an order's status." })
  updateOrderStatus(
    @Param("id") id: string,
    @Body() dto: { status: string },
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.adminService.updateOrderStatus(id, dto.status, user.id);
  }

  @Get("products")
  @ApiOperation({ summary: "List products from the admin catalog view." })
  products(@Query() query: PaginationQueryDto) {
    return this.adminService.products(query);
  }

  @Post("products")
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: "Create a product from the admin panel." })
  createProduct(@Body() dto: CreateProductDto, @CurrentUser() user: AuthenticatedUser) {
    return this.adminService.createProduct(dto, user.id);
  }

  @Put("products/:id")
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: "Update a product from the admin panel." })
  updateProduct(
    @Param("id") id: string,
    @Body() dto: UpdateProductDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.adminService.updateProduct(id, dto, user.id);
  }

  @Delete("products/:id")
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: "Soft-delete a product from the admin panel." })
  deleteProduct(@Param("id") id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.adminService.deleteProduct(id, user.id);
  }

  @Get("reports")
  @ApiOperation({ summary: "Get revenue, refund, and sales report data." })
  reports() {
    return this.adminService.reports();
  }

  @Get("analytics")
  @ApiOperation({ summary: "Get product, customer, revenue, and activity analytics." })
  analytics() {
    return this.adminService.analytics();
  }

  @Get("logs")
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: "Get admin audit and login logs." })
  logs(@Query() query: PaginationQueryDto) {
    return this.adminService.logs(query);
  }
}
