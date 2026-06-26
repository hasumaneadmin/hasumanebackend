import { Module } from "@nestjs/common";
import { PrismaModule } from "../../prisma/prisma.module.js";
import { MetricsService } from "./metrics.service.js";
import { MonitoringController } from "./monitoring.controller.js";

@Module({
  imports: [PrismaModule],
  controllers: [MonitoringController],
  providers: [MetricsService],
  exports: [MetricsService],
})
export class MonitoringModule {}
