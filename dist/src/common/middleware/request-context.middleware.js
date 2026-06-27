var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Injectable } from "@nestjs/common";
import { randomUUID } from "node:crypto";
let RequestContextMiddleware = class RequestContextMiddleware {
    use(req, res, next) {
        const requestId = req.header("x-request-id") || randomUUID();
        req.context = {
            requestId,
            ipAddress: req.ip,
            userAgent: req.header("user-agent"),
        };
        res.setHeader("x-request-id", requestId);
        next();
    }
};
RequestContextMiddleware = __decorate([
    Injectable()
], RequestContextMiddleware);
export { RequestContextMiddleware };
//# sourceMappingURL=request-context.middleware.js.map