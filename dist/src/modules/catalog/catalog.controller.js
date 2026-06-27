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
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Role } from "../../common/constants/roles.js";
import { CurrentUser } from "../../common/decorators/current-user.decorator.js";
import { Public } from "../../common/decorators/public.decorator.js";
import { Roles } from "../../common/decorators/roles.decorator.js";
import { PaginationQueryDto } from "../../common/dto/pagination-query.dto.js";
import { CatalogService } from "./catalog.service.js";
import { CreateCategoryDto, UpdateCategoryDto } from "./dto/category.dto.js";
import { CreateProductDto, UpdateProductDto } from "./dto/product.dto.js";
let ProductsController = class ProductsController {
    catalogService;
    constructor(catalogService) {
        this.catalogService = catalogService;
    }
    list(query) {
        return this.catalogService.listProducts(query);
    }
    search(query) {
        return this.catalogService.searchProducts(query);
    }
    get(id) {
        return this.catalogService.getProduct(id);
    }
    create(dto, user) {
        return this.catalogService.createProduct(dto, user.id);
    }
    update(id, dto, user) {
        return this.catalogService.updateProduct(id, dto, user.id);
    }
    remove(id, user) {
        return this.catalogService.deleteProduct(id, user.id);
    }
};
__decorate([
    Public(),
    Get(),
    __param(0, Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [PaginationQueryDto]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "list", null);
__decorate([
    Public(),
    Get("search"),
    __param(0, Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [PaginationQueryDto]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "search", null);
__decorate([
    Public(),
    Get(":id"),
    __param(0, Param("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "get", null);
__decorate([
    Post(),
    ApiBearerAuth(),
    Roles(Role.ADMIN),
    __param(0, Body()),
    __param(1, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CreateProductDto, Object]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "create", null);
__decorate([
    Put(":id"),
    ApiBearerAuth(),
    Roles(Role.ADMIN),
    __param(0, Param("id")),
    __param(1, Body()),
    __param(2, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, UpdateProductDto, Object]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "update", null);
__decorate([
    Delete(":id"),
    ApiBearerAuth(),
    Roles(Role.ADMIN),
    __param(0, Param("id")),
    __param(1, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "remove", null);
ProductsController = __decorate([
    ApiTags("Products"),
    Controller({ path: "products", version: "1" }),
    __metadata("design:paramtypes", [CatalogService])
], ProductsController);
export { ProductsController };
let CategoriesController = class CategoriesController {
    catalogService;
    constructor(catalogService) {
        this.catalogService = catalogService;
    }
    list() {
        return this.catalogService.listCategories();
    }
    create(dto, user) {
        return this.catalogService.createCategory(dto, user.id);
    }
    update(id, dto, user) {
        return this.catalogService.updateCategory(id, dto, user.id);
    }
    remove(id, user) {
        return this.catalogService.deleteCategory(id, user.id);
    }
};
__decorate([
    Public(),
    Get(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CategoriesController.prototype, "list", null);
__decorate([
    Post(),
    ApiBearerAuth(),
    Roles(Role.ADMIN),
    __param(0, Body()),
    __param(1, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CreateCategoryDto, Object]),
    __metadata("design:returntype", void 0)
], CategoriesController.prototype, "create", null);
__decorate([
    Put(":id"),
    ApiBearerAuth(),
    Roles(Role.ADMIN),
    __param(0, Param("id")),
    __param(1, Body()),
    __param(2, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, UpdateCategoryDto, Object]),
    __metadata("design:returntype", void 0)
], CategoriesController.prototype, "update", null);
__decorate([
    Delete(":id"),
    ApiBearerAuth(),
    Roles(Role.ADMIN),
    __param(0, Param("id")),
    __param(1, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], CategoriesController.prototype, "remove", null);
CategoriesController = __decorate([
    ApiTags("Categories"),
    Controller({ path: "categories", version: "1" }),
    __metadata("design:paramtypes", [CatalogService])
], CategoriesController);
export { CategoriesController };
//# sourceMappingURL=catalog.controller.js.map