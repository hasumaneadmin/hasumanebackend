import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import type { Response } from "express";
import type { AuthenticatedRequest } from "../types/authenticated-request.js";

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<AuthenticatedRequest>();
    const response = ctx.getResponse<Response>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse =
      exception instanceof HttpException ? exception.getResponse() : undefined;
    const message =
      typeof exceptionResponse === "object" &&
      exceptionResponse &&
      "message" in exceptionResponse
        ? exceptionResponse.message
        : exception instanceof Error
          ? exception.message
          : "Unexpected server error.";

    const details =
      typeof exceptionResponse === "object" &&
      exceptionResponse &&
      "message" in exceptionResponse &&
      Array.isArray(exceptionResponse.message)
        ? exceptionResponse.message
        : [];

    if (status >= 500) {
      this.logger.error(
        `${request.method} ${request.originalUrl} failed`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    response.status(status).json({
      success: false,
      message: Array.isArray(message) ? "Validation failed." : String(message),
      errorCode:
        typeof exceptionResponse === "object" && exceptionResponse && "error" in exceptionResponse
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
}
