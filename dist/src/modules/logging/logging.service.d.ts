import { Prisma } from "@prisma/client";
import pino from "pino";
import { PrismaService } from "../../prisma/prisma.service.js";
import type { LogQueryDto } from "./dto/log-query.dto.js";
export type LogLevel = "trace" | "debug" | "info" | "warn" | "error" | "fatal";
export type LogCategory = "authentication" | "authorization" | "business" | "system" | "api" | "error" | "security";
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
export declare class LoggingService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    getLogger(): pino.Logger;
    log(input: StructuredLogInput): Promise<void>;
    list(query: LogQueryDto): Promise<{
        data: {
            message: string;
            level: string;
            id: string;
            userId: string | null;
            createdAt: Date;
            module: string;
            category: string;
            requestId: string | null;
            endpoint: string | null;
            method: string | null;
            statusCode: number | null;
            durationMs: number | null;
            metadata: Prisma.JsonValue | null;
            errorStack: string | null;
        }[];
        meta: import("../../common/utils/pagination.js").PaginationMeta;
    }>;
}
