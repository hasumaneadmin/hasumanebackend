import { Module } from "@nestjs/common";
import { CatalogModule } from "../catalog/catalog.module.js";
import { AdminController } from "./admin.controller.js";
import { AdminService } from "./admin.service.js";

@Module({
  imports: [CatalogModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
