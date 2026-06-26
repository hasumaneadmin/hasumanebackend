import { Injectable, Logger, OnModuleDestroy } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Redis } from "ioredis";

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private readonly client?: Redis;

  constructor(configService: ConfigService) {
    const redisUrl = configService.get<string>("app.redisUrl");
    if (redisUrl) {
      this.client = new Redis(redisUrl, {
        maxRetriesPerRequest: 2,
        lazyConnect: true,
      });
      this.client.on("error", (error: Error) => this.logger.warn(`Redis error: ${error.message}`));
    }
  }

  getClient() {
    return this.client;
  }

  async onModuleDestroy() {
    await this.client?.quit();
  }
}
