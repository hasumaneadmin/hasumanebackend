import { Injectable } from "@nestjs/common";
import { performance } from "node:perf_hooks";
import { PrismaService } from "../../prisma/prisma.service.js";

type RequestMetric = {
  method: string;
  route: string;
  statusCode: number;
  durationMs: number;
};

@Injectable()
export class MetricsService {
  private startedAt = Date.now();
  private totalRequests = 0;
  private totalErrors = 0;
  private totalDurationMs = 0;
  private recent: RequestMetric[] = [];
  private lastCpuUsage = process.cpuUsage();
  private lastCpuCheck = performance.now();

  constructor(private readonly prisma: PrismaService) {}

  recordHttp(metric: RequestMetric) {
    this.totalRequests += 1;
    this.totalDurationMs += metric.durationMs;
    if (metric.statusCode >= 500) this.totalErrors += 1;
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

  private minutesAgo(minutes: number) {
    return new Date(Date.now() - minutes * 60 * 1000);
  }

  private cpuPercent() {
    const currentUsage = process.cpuUsage();
    const currentCheck = performance.now();
    const userMicros = currentUsage.user - this.lastCpuUsage.user;
    const systemMicros = currentUsage.system - this.lastCpuUsage.system;
    const elapsedMicros = (currentCheck - this.lastCpuCheck) * 1000;
    this.lastCpuUsage = currentUsage;
    this.lastCpuCheck = currentCheck;
    if (elapsedMicros <= 0) return 0;
    return Math.min(100, ((userMicros + systemMicros) / elapsedMicros) * 100);
  }
}
