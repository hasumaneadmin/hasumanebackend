import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { catchError, tap, throwError, type Observable } from "rxjs";
import type { Response } from "express";
import { LoggingService } from "../../modules/logging/logging.service.js";
import { MetricsService } from "../../modules/monitoring/metrics.service.js";
import type { AuthenticatedRequest } from "../types/authenticated-request.js";

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(
    private readonly metricsService: MetricsService,
    private readonly loggingService: LoggingService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const response = context.switchToHttp().getResponse<Response>();
    const startedAt = Date.now();

    return next.handle().pipe(
      tap(() => {
        const durationMs = Date.now() - startedAt;
        this.metricsService.recordHttp({
          method: request.method,
          route: request.route?.path || request.originalUrl,
          statusCode: response.statusCode,
          durationMs,
        });
        void this.loggingService.log({
          level: response.statusCode >= 400 ? "warn" : "info",
          category: "api",
          module: this.moduleFromPath(request.originalUrl),
          message: `${request.method} ${request.originalUrl}`,
          requestId: request.context?.requestId,
          userId: request.user?.id,
          endpoint: request.originalUrl,
          method: request.method,
          statusCode: response.statusCode,
          durationMs,
        });
      }),
      catchError((error: unknown) => {
        const durationMs = Date.now() - startedAt;
        this.metricsService.recordHttp({
          method: request.method,
          route: request.route?.path || request.originalUrl,
          statusCode: response.statusCode >= 400 ? response.statusCode : 500,
          durationMs,
        });
        void this.loggingService.log({
          level: "error",
          category: "error",
          module: this.moduleFromPath(request.originalUrl),
          message: `${request.method} ${request.originalUrl} failed`,
          requestId: request.context?.requestId,
          userId: request.user?.id,
          endpoint: request.originalUrl,
          method: request.method,
          statusCode: response.statusCode >= 400 ? response.statusCode : 500,
          durationMs,
          errorStack: error instanceof Error ? error.stack : String(error),
        });
        return throwError(() => error);
      }),
    );
  }

  private moduleFromPath(path: string) {
    const [, , , moduleName] = path.split("/");
    return moduleName || "root";
  }
}
