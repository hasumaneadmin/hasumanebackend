var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable, } from "@nestjs/common";
import { catchError, tap, throwError } from "rxjs";
import { LoggingService } from "../../modules/logging/logging.service.js";
import { MetricsService } from "../../modules/monitoring/metrics.service.js";
let LoggingInterceptor = class LoggingInterceptor {
    metricsService;
    loggingService;
    constructor(metricsService, loggingService) {
        this.metricsService = metricsService;
        this.loggingService = loggingService;
    }
    intercept(context, next) {
        const request = context.switchToHttp().getRequest();
        const response = context.switchToHttp().getResponse();
        const startedAt = Date.now();
        return next.handle().pipe(tap(() => {
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
        }), catchError((error) => {
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
        }));
    }
    moduleFromPath(path) {
        const [, , , moduleName] = path.split("/");
        return moduleName || "root";
    }
};
LoggingInterceptor = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [MetricsService,
        LoggingService])
], LoggingInterceptor);
export { LoggingInterceptor };
//# sourceMappingURL=logging.interceptor.js.map