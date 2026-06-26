import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import type { Response } from "express";
import type { Request } from "express";
import { map, type Observable } from "rxjs";

type ApiEnvelope<T> = {
  success: boolean;
  message: string;
  data: T;
  meta?: Record<string, unknown>;
};

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, ApiEnvelope<T> | T> {
  intercept(context: ExecutionContext, next: CallHandler<T>): Observable<ApiEnvelope<T> | T> {
    const httpResponse = context.switchToHttp().getResponse<Response>();
    const request = context.switchToHttp().getRequest<Request>();
    return next.handle().pipe(
      map((payload: T | ApiEnvelope<T>) => {
        const contentType = String(httpResponse.getHeader("content-type") || "");
        if (
          contentType.includes("text/plain") ||
          contentType.includes("text/csv") ||
          contentType.includes("application/pdf") ||
          request.originalUrl.endsWith("/metrics")
        ) {
          return payload as T;
        }

        if (
          payload &&
          typeof payload === "object" &&
          "success" in payload &&
          "message" in payload &&
          "data" in payload
        ) {
          return payload as ApiEnvelope<T>;
        }

        return {
          success: true,
          message: "Request completed successfully.",
          data: payload as T,
        };
      }),
    );
  }
}
