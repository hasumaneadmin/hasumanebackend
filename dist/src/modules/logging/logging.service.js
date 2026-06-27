var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable } from "@nestjs/common";
import pino from "pino";
import { getPagination, buildPaginationMeta } from "../../common/utils/pagination.js";
import { PrismaService } from "../../prisma/prisma.service.js";
let LoggingService = class LoggingService {
    prisma;
    logger;
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = pino({
            level: process.env.LOG_LEVEL || "info",
            transport: process.env.NODE_ENV === "production"
                ? undefined
                : {
                    target: "pino-pretty",
                    options: {
                        colorize: true,
                        singleLine: true,
                        translateTime: "SYS:standard",
                    },
                },
            base: {
                service: "hasumane-api",
                environment: process.env.NODE_ENV || "development",
            },
        });
    }
    getLogger() {
        return this.logger;
    }
    async log(input) {
        this.logger[input.level]({
            category: input.category,
            module: input.module,
            requestId: input.requestId,
            userId: input.userId,
            endpoint: input.endpoint,
            method: input.method,
            statusCode: input.statusCode,
            durationMs: input.durationMs,
            err: input.errorStack ? { stack: input.errorStack } : undefined,
            metadata: input.metadata,
        }, input.message);
        try {
            await this.prisma.systemLog.create({
                data: {
                    level: input.level,
                    category: input.category,
                    module: input.module,
                    message: input.message,
                    requestId: input.requestId,
                    userId: input.userId,
                    endpoint: input.endpoint,
                    method: input.method,
                    statusCode: input.statusCode,
                    durationMs: input.durationMs,
                    errorStack: input.errorStack,
                    metadata: input.metadata === undefined
                        ? undefined
                        : JSON.parse(JSON.stringify(input.metadata)),
                },
            });
        }
        catch (error) {
            this.logger.warn({ err: error instanceof Error ? error : undefined }, "Failed to persist structured log.");
        }
    }
    async list(query) {
        const { page, limit, skip, take } = getPagination(query);
        const where = {
            ...(query.severity ? { level: query.severity } : {}),
            ...(query.module ? { module: query.module } : {}),
            ...(query.category ? { category: query.category } : {}),
            ...(query.search
                ? {
                    OR: [
                        { message: { contains: query.search, mode: "insensitive" } },
                        { endpoint: { contains: query.search, mode: "insensitive" } },
                        { module: { contains: query.search, mode: "insensitive" } },
                        { category: { contains: query.search, mode: "insensitive" } },
                    ],
                }
                : {}),
            ...(query.from || query.to
                ? {
                    createdAt: {
                        ...(query.from ? { gte: new Date(query.from) } : {}),
                        ...(query.to ? { lte: new Date(query.to) } : {}),
                    },
                }
                : {}),
        };
        const [logs, total] = await this.prisma.$transaction([
            this.prisma.systemLog.findMany({
                where,
                skip,
                take,
                orderBy: { createdAt: "desc" },
            }),
            this.prisma.systemLog.count({ where }),
        ]);
        return {
            data: logs,
            meta: buildPaginationMeta(page, limit, total),
        };
    }
};
LoggingService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService])
], LoggingService);
export { LoggingService };
//# sourceMappingURL=logging.service.js.map