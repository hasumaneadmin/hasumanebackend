import { LogQueryDto } from "./dto/log-query.dto.js";
import { LoggingService } from "./logging.service.js";
export declare class LoggingController {
    private readonly loggingService;
    constructor(loggingService: LoggingService);
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
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            errorStack: string | null;
        }[];
        meta: import("../../common/utils/pagination.js").PaginationMeta;
    }>;
}
