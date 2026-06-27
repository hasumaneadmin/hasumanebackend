import { CallHandler, ExecutionContext, NestInterceptor } from "@nestjs/common";
import { type Observable } from "rxjs";
type ApiEnvelope<T> = {
    success: boolean;
    message: string;
    data: T;
    meta?: Record<string, unknown>;
};
export declare class ResponseInterceptor<T> implements NestInterceptor<T, ApiEnvelope<T> | T> {
    intercept(context: ExecutionContext, next: CallHandler<T>): Observable<ApiEnvelope<T> | T>;
}
export {};
