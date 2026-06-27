var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Controller, Get } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Public } from "../../common/decorators/public.decorator.js";
import { PrismaService } from "../../prisma/prisma.service.js";
import { RedisService } from "../../config/redis.service.js";
let HealthController = class HealthController {
    prisma;
    redisService;
    constructor(prisma, redisService) {
        this.prisma = prisma;
        this.redisService = redisService;
    }
    async health() {
        await this.prisma.$queryRaw `SELECT 1`;
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
    liveness() {
        return {
            service: "hasumane-api",
            status: "ok",
            checkedAt: new Date().toISOString(),
        };
    }
    async readiness() {
        return this.health();
    }
};
__decorate([
    Public(),
    Get(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], HealthController.prototype, "health", null);
__decorate([
    Public(),
    Get("live"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], HealthController.prototype, "liveness", null);
__decorate([
    Public(),
    Get("ready"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], HealthController.prototype, "readiness", null);
HealthController = __decorate([
    ApiTags("Health"),
    Controller({ path: "health", version: "1" }),
    __metadata("design:paramtypes", [PrismaService,
        RedisService])
], HealthController);
export { HealthController };
//# sourceMappingURL=health.controller.js.map