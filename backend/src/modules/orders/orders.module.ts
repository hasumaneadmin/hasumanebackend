import { Module } from "@nestjs/common";
import { CartController, OrdersController } from "./orders.controller.js";
import { OrdersService } from "./orders.service.js";

@Module({
  controllers: [OrdersController, CartController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
