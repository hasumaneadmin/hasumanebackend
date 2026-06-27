var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var HttpExceptionFilter_1;
import { Catch, HttpException, HttpStatus, Logger, } from "@nestjs/common";
let HttpExceptionFilter = HttpExceptionFilter_1 = class HttpExceptionFilter {
    logger = new Logger(HttpExceptionFilter_1.name);
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const request = ctx.getRequest();
        const response = ctx.getResponse();
        const status = exception instanceof HttpException
            ? exception.getStatus()
            : HttpStatus.INTERNAL_SERVER_ERROR;
        const exceptionResponse = exception instanceof HttpException ? exception.getResponse() : undefined;
        const message = typeof exceptionResponse === "object" &&
            exceptionResponse &&
            "message" in exceptionResponse
            ? exceptionResponse.message
            : exception instanceof Error
                ? exception.message
                : "Unexpected server error.";
        const details = typeof exceptionResponse === "object" &&
            exceptionResponse &&
            "message" in exceptionResponse &&
            Array.isArray(exceptionResponse.message)
            ? exceptionResponse.message
            : [];
        if (status >= 500) {
            this.logger.error(`${request.method} ${request.originalUrl} failed`, exception instanceof Error ? exception.stack : String(exception));
        }
        response.status(status).json({
            success: false,
            message: Array.isArray(message) ? "Validation failed." : String(message),
            errorCode: typeof exceptionResponse === "object" && exceptionResponse && "error" in exceptionResponse
                ? String(exceptionResponse.error)
                : HttpStatus[status] || "ERROR",
            details,
            meta: {
                requestId: request.context?.requestId,
                timestamp: new Date().toISOString(),
                path: request.originalUrl,
            },
        });
    }
};
HttpExceptionFilter = HttpExceptionFilter_1 = __decorate([
    Catch()
], HttpExceptionFilter);
export { HttpExceptionFilter };
//# sourceMappingURL=http-exception.filter.js.map