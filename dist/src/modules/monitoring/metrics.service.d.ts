import { PrismaService } from "../../prisma/prisma.service.js";
type RequestMetric = {
    method: string;
    route: string;
    statusCode: number;
    durationMs: number;
};
export declare class MetricsService {
    private readonly prisma;
    private startedAt;
    private totalRequests;
    private totalErrors;
    private totalDurationMs;
    private recent;
    private lastCpuUsage;
    private lastCpuCheck;
    constructor(prisma: PrismaService);
    recordHttp(metric: RequestMetric): void;
    prometheus(): Promise<string>;
    private minutesAgo;
    private cpuPercent;
}
export {};
