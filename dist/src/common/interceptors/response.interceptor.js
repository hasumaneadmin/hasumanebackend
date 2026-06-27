var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Injectable, } from "@nestjs/common";
import { map } from "rxjs";
let ResponseInterceptor = class ResponseInterceptor {
    intercept(context, next) {
        const httpResponse = context.switchToHttp().getResponse();
        const request = context.switchToHttp().getRequest();
        return next.handle().pipe(map((payload) => {
            const contentType = String(httpResponse.getHeader("content-type") || "");
            if (contentType.includes("text/plain") ||
                contentType.includes("text/csv") ||
                contentType.includes("application/pdf") ||
                request.originalUrl.endsWith("/metrics")) {
                return payload;
            }
            if (payload &&
                typeof payload === "object" &&
                "success" in payload &&
                "message" in payload &&
                "data" in payload) {
                return payload;
            }
            return {
                success: true,
                message: "Request completed successfully.",
                data: payload,
            };
        }));
    }
};
ResponseInterceptor = __decorate([
    Injectable()
], ResponseInterceptor);
export { ResponseInterceptor };
//# sourceMappingURL=response.interceptor.js.map