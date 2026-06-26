import { Module } from "@nestjs/common";
import { CatalogService } from "./catalog.service.js";
import { CategoriesController, ProductsController } from "./catalog.controller.js";

@Module({
  controllers: [ProductsController, CategoriesController],
  providers: [CatalogService],
  exports: [CatalogService],
})
export class CatalogModule {}
