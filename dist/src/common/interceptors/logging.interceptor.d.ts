import { CallHandler, ExecutionContext, NestInterceptor } from "@nestjs/common";
import { type Observable } from "rxjs";
import { LoggingService } from "../../modules/logging/logging.service.js";
import { MetricsService } from "../../modules/monitoring/metrics.service.js";
export declare class LoggingInterceptor implements NestInterceptor {
    private readonly metricsService;
    private readonly loggingService;
    constructor(metricsService: MetricsService, loggingService: LoggingService);
    intercept(context: ExecutionContext, next: CallHandler): Observable<unknown>;
    private moduleFromPath;
}
