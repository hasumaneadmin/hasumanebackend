import { Body, Controller, Delete, Get, Param, Post, Put, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Role } from "../../common/constants/roles.js";
import { CurrentUser } from "../../common/decorators/current-user.decorator.js";
import { Roles } from "../../common/decorators/roles.decorator.js";
import { PaginationQueryDto } from "../../common/dto/pagination-query.dto.js";
import type { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { AddCartItemDto, RemoveCartItemDto, UpdateCartItemDto } from "./dto/cart.dto.js";
import { CreateOrderDto } from "./dto/create-order.dto.js";
import { OrdersService } from "./orders.service.js";

@ApiBearerAuth()
@ApiTags("Orders")
@Roles(Role.CUSTOMER)
@Controller({ path: "orders", version: "1" })
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({ summary: "Create an order from explicit items or the active cart." })
  create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateOrderDto) {
    return this.ordersService.createOrder(user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: "List the authenticated user's orders." })
  list(@CurrentUser() user: AuthenticatedUser, @Query() query: PaginationQueryDto) {
    return this.ordersService.listOrders(user.id, query);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get one authenticated user order." })
  get(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string) {
    return this.ordersService.getOrder(user.id, id);
  }

  @Put(":id/cancel")
  @ApiOperation({ summary: "Cancel a pending or processing order." })
  cancel(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string) {
    return this.ordersService.cancelOrder(user.id, id);
  }
}

@ApiBearerAuth()
@ApiTags("Cart")
@Roles(Role.CUSTOMER)
@Controller({ path: "cart", version: "1" })
export class CartController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  @ApiOperation({ summary: "Get the authenticated user's active cart." })
  get(@CurrentUser() user: AuthenticatedUser) {
    return this.ordersService.getCart(user.id);
  }

  @Post("add")
  @ApiOperation({ summary: "Add a product or variant to the active cart." })
  add(@CurrentUser() user: AuthenticatedUser, @Body() dto: AddCartItemDto) {
    return this.ordersService.addToCart(user.id, dto);
  }

  @Put("update")
  @ApiOperation({ summary: "Update active cart item quantity." })
  update(@CurrentUser() user: AuthenticatedUser, @Body() dto: UpdateCartItemDto) {
    return this.ordersService.updateCartItem(user.id, dto);
  }

  @Delete("remove")
  @ApiOperation({ summary: "Remove an item from the active cart." })
  remove(@CurrentUser() user: AuthenticatedUser, @Body() dto: RemoveCartItemDto) {
    return this.ordersService.removeCartItem(user.id, dto.itemId);
  }
}
