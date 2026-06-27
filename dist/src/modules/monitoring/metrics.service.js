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
import { performance } from "node:perf_hooks";
import { PrismaService } from "../../prisma/prisma.service.js";
let MetricsService = class MetricsService {
    prisma;
    startedAt = Date.now();
    totalRequests = 0;
    totalErrors = 0;
    totalDurationMs = 0;
    recent = [];
    lastCpuUsage = process.cpuUsage();
    lastCpuCheck = performance.now();
    constructor(prisma) {
        this.prisma = prisma;
    }
    recordHttp(metric) {
        this.totalRequests += 1;
        this.totalDurationMs += metric.durationMs;
        if (metric.statusCode >= 500)
            this.totalErrors += 1;
        this.recent.unshift(metric);
        this.recent.splice(100);
    }
    async prometheus() {
        const memory = process.memoryUsage();
        const averageDuration = this.totalRequests ? this.totalDurationMs / this.totalRequests : 0;
        const cpuPercent = this.cpuPercent();
        const [activeUsers, lowInventory] = await Promise.all([
            this.prisma.user.count({ where: { deletedAt: null, lastLoginAt: { gte: this.minutesAgo(30) } } }),
            this.prisma.inventoryItem.count({
                where: {
                    deletedAt: null,
                    OR: [{ status: "low_stock" }, { status: "out_of_stock" }],
                },
            }),
        ]);
        const lines = [
            "# HELP hasumane_api_uptime_seconds Process uptime in seconds.",
            "# TYPE hasumane_api_uptime_seconds gauge",
            `hasumane_api_uptime_seconds ${Math.floor((Date.now() - this.startedAt) / 1000)}`,
            "# HELP hasumane_api_requests_total Total HTTP requests observed by NestJS.",
            "# TYPE hasumane_api_requests_total counter",
            `hasumane_api_requests_total ${this.totalRequests}`,
            "# HELP hasumane_api_errors_total Total HTTP 5xx responses observed by NestJS.",
            "# TYPE hasumane_api_errors_total counter",
            `hasumane_api_errors_total ${this.totalErrors}`,
            "# HELP hasumane_api_request_duration_average_ms Average HTTP request duration in milliseconds.",
            "# TYPE hasumane_api_request_duration_average_ms gauge",
            `hasumane_api_request_duration_average_ms ${averageDuration.toFixed(2)}`,
            "# HELP hasumane_api_active_users Users active in the last 30 minutes.",
            "# TYPE hasumane_api_active_users gauge",
            `hasumane_api_active_users ${activeUsers}`,
            "# HELP hasumane_api_database_queries_total Count of observed database query operations.",
            "# TYPE hasumane_api_database_queries_total counter",
            `hasumane_api_database_queries_total ${this.prisma.getQueryCount()}`,
            "# HELP hasumane_api_low_inventory_items Count of low or out-of-stock inventory items.",
            "# TYPE hasumane_api_low_inventory_items gauge",
            `hasumane_api_low_inventory_items ${lowInventory}`,
            "# HELP hasumane_api_memory_heap_used_bytes Node.js heap used in bytes.",
            "# TYPE hasumane_api_memory_heap_used_bytes gauge",
            `hasumane_api_memory_heap_used_bytes ${memory.heapUsed}`,
            "# HELP hasumane_api_memory_rss_bytes Resident set size in bytes.",
            "# TYPE hasumane_api_memory_rss_bytes gauge",
            `hasumane_api_memory_rss_bytes ${memory.rss}`,
            "# HELP hasumane_api_cpu_usage_percent Process CPU usage percentage since last scrape.",
            "# TYPE hasumane_api_cpu_usage_percent gauge",
            `hasumane_api_cpu_usage_percent ${cpuPercent.toFixed(2)}`,
        ];
        return `${lines.join("\n")}\n`;
    }
    minutesAgo(minutes) {
        return new Date(Date.now() - minutes * 60 * 1000);
    }
    cpuPercent() {
        const currentUsage = process.cpuUsage();
        const currentCheck = performance.now();
        const userMicros = currentUsage.user - this.lastCpuUsage.user;
        const systemMicros = currentUsage.system - this.lastCpuUsage.system;
        const elapsedMicros = (currentCheck - this.lastCpuCheck) * 1000;
        this.lastCpuUsage = currentUsage;
        this.lastCpuCheck = currentCheck;
        if (elapsedMicros <= 0)
            return 0;
        return Math.min(100, ((userMicros + systemMicros) / elapsedMicros) * 100);
    }
};
MetricsService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService])
], MetricsService);
export { MetricsService };
//# sourceMappingURL=metrics.service.js.map