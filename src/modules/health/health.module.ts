import { Module } from "@nestjs/common";
import { RedisService } from "../../config/redis.service.js";
import { PrismaModule } from "../../prisma/prisma.module.js";
import { HealthController } from "./health.controller.js";

@Module({
  imports: [PrismaModule],
  controllers: [HealthController],
  providers: [RedisService],
})
export class HealthModule {}
