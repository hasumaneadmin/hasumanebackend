import { PrismaService } from "../../prisma/prisma.service.js";
import { RedisService } from "../../config/redis.service.js";
export declare class HealthController {
    private readonly prisma;
    private readonly redisService;
    constructor(prisma: PrismaService, redisService: RedisService);
    health(): Promise<{
        service: string;
        status: string;
        dependencies: {
            postgres: string;
            redis: string;
        };
        checkedAt: string;
    }>;
    liveness(): {
        service: string;
        status: string;
        checkedAt: string;
    };
    readiness(): Promise<{
        service: string;
        status: string;
        dependencies: {
            postgres: string;
            redis: string;
        };
        checkedAt: string;
    }>;
}
