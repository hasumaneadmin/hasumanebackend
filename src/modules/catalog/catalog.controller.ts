import { Body, Controller, Delete, Get, Param, Post, Put, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Role } from "../../common/constants/roles.js";
import { CurrentUser } from "../../common/decorators/current-user.decorator.js";
import { Public } from "../../common/decorators/public.decorator.js";
import { Roles } from "../../common/decorators/roles.decorator.js";
import { PaginationQueryDto } from "../../common/dto/pagination-query.dto.js";
import type { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { CatalogService } from "./catalog.service.js";
import { CreateCategoryDto, UpdateCategoryDto } from "./dto/category.dto.js";
import { CreateProductDto, UpdateProductDto } from "./dto/product.dto.js";

@ApiTags("Products")
@Controller({ path: "products", version: "1" })
export class ProductsController {
  constructor(private readonly catalogService: CatalogService) {}

  @Public()
  @Get()
  list(@Query() query: PaginationQueryDto) {
    return this.catalogService.listProducts(query);
  }

  @Public()
  @Get("search")
  search(@Query() query: PaginationQueryDto) {
    return this.catalogService.searchProducts(query);
  }

  @Public()
  @Get(":id")
  get(@Param("id") id: string) {
    return this.catalogService.getProduct(id);
  }

  @Post()
  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  create(@Body() dto: CreateProductDto, @CurrentUser() user: AuthenticatedUser) {
    return this.catalogService.createProduct(dto, user.id);
  }

  @Put(":id")
  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  update(@Param("id") id: string, @Body() dto: UpdateProductDto, @CurrentUser() user: AuthenticatedUser) {
    return this.catalogService.updateProduct(id, dto, user.id);
  }

  @Delete(":id")
  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  remove(@Param("id") id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.catalogService.deleteProduct(id, user.id);
  }
}

@ApiTags("Categories")
@Controller({ path: "categories", version: "1" })
export class CategoriesController {
  constructor(private readonly catalogService: CatalogService) {}

  @Public()
  @Get()
  list() {
    return this.catalogService.listCategories();
  }

  @Post()
  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  create(@Body() dto: CreateCategoryDto, @CurrentUser() user: AuthenticatedUser) {
    return this.catalogService.createCategory(dto, user.id);
  }

  @Put(":id")
  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  update(@Param("id") id: string, @Body() dto: UpdateCategoryDto, @CurrentUser() user: AuthenticatedUser) {
    return this.catalogService.updateCategory(id, dto, user.id);
  }

  @Delete(":id")
  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  remove(@Param("id") id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.catalogService.deleteCategory(id, user.id);
  }
}
