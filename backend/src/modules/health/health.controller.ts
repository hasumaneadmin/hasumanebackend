import { Controller, Get } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Public } from "../../common/decorators/public.decorator.js";
import { PrismaService } from "../../prisma/prisma.service.js";
import { RedisService } from "../../config/redis.service.js";

@ApiTags("Health")
@Controller({ path: "health", version: "1" })
export class HealthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redisService: RedisService,
  ) {}

  @Public()
  @Get()
  async health() {
    await this.prisma.$queryRaw`SELECT 1`;
    const redis = this.redisService.getClient();
    const redisStatus = redis ? redis.status : "disabled";
    return {
      service: "hasumane-api",
      status: "ok",
      dependencies: {
        postgres: "ok",
        redis: redisStatus,
      },
      checkedAt: new Date().toISOString(),
    };
  }

  @Public()
  @Get("live")
  liveness() {
    return {
      service: "hasumane-api",
      status: "ok",
      checkedAt: new Date().toISOString(),
    };
  }

  @Public()
  @Get("ready")
  async readiness() {
    return this.health();
  }
}
