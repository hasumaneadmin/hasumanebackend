var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var RedisService_1;
import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Redis } from "ioredis";
let RedisService = RedisService_1 = class RedisService {
    logger = new Logger(RedisService_1.name);
    client;
    constructor(configService) {
        const redisUrl = configService.get("app.redisUrl");
        if (redisUrl) {
            this.client = new Redis(redisUrl, {
                maxRetriesPerRequest: 2,
                lazyConnect: true,
            });
            this.client.on("error", (error) => this.logger.warn(`Redis error: ${error.message}`));
        }
    }
    getClient() {
        return this.client;
    }
    async onModuleDestroy() {
        await this.client?.quit();
    }
};
RedisService = RedisService_1 = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [ConfigService])
], RedisService);
export { RedisService };
//# sourceMappingURL=redis.service.js.map