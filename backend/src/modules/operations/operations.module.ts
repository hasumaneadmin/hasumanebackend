import { Module } from "@nestjs/common";
import { PrismaModule } from "../../prisma/prisma.module.js";
import {
  AdminSummaryController,
  DispatchController,
  FarmersController,
  LeadsController,
  NotificationsController,
  ProcurementController,
  RolePermissionsController,
  SecurityController,
  SettingsController,
  SubscriptionsController,
} from "./operations.controller.js";
import { OperationsService } from "./operations.service.js";

@Module({
  imports: [PrismaModule],
  controllers: [
    LeadsController,
    AdminSummaryController,
    SubscriptionsController,
    DispatchController,
    FarmersController,
    ProcurementController,
    NotificationsController,
    SettingsController,
    SecurityController,
    RolePermissionsController,
  ],
  providers: [OperationsService],
})
export class OperationsModule {}
