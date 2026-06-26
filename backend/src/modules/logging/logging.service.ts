import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import pino, { type Logger } from "pino";
import { getPagination, buildPaginationMeta } from "../../common/utils/pagination.js";
import { PrismaService } from "../../prisma/prisma.service.js";
import type { LogQueryDto } from "./dto/log-query.dto.js";

export type LogLevel = "trace" | "debug" | "info" | "warn" | "error" | "fatal";
export type LogCategory =
  | "authentication"
  | "authorization"
  | "business"
  | "system"
  | "api"
  | "error"
  | "security";

export type StructuredLogInput = {
  level: LogLevel;
  category: LogCategory;
  module: string;
  message: string;
  requestId?: string;
  userId?: string;
  endpoint?: string;
  method?: string;
  statusCode?: number;
  durationMs?: number;
  errorStack?: string;
  metadata?: unknown;
};

@Injectable()
export class LoggingService {
  private readonly logger: Logger;

  constructor(private readonly prisma: PrismaService) {
    this.logger = pino({
      level: process.env.LOG_LEVEL || "info",
      transport:
        process.env.NODE_ENV === "production"
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

  async log(input: StructuredLogInput) {
    this.logger[input.level](
      {
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
      },
      input.message,
    );

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
          metadata:
            input.metadata === undefined
              ? undefined
              : (JSON.parse(JSON.stringify(input.metadata)) as Prisma.InputJsonValue),
        },
      });
    } catch (error) {
      this.logger.warn(
        { err: error instanceof Error ? error : undefined },
        "Failed to persist structured log.",
      );
    }
  }

  async list(query: LogQueryDto) {
    const { page, limit, skip, take } = getPagination(query);
    const where: Prisma.SystemLogWhereInput = {
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
}
