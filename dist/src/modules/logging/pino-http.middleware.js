var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable } from "@nestjs/common";
import { pinoHttp } from "pino-http";
import { randomUUID } from "node:crypto";
import { LoggingService } from "./logging.service.js";
let PinoHttpMiddleware = class PinoHttpMiddleware {
    loggingService;
    constructor(loggingService) {
        this.loggingService = loggingService;
    }
    use(req, res, next) {
        return pinoHttp({
            logger: this.loggingService.getLogger(),
            genReqId: () => req.context?.requestId || req.header("x-request-id") || randomUUID(),
            customProps: () => ({
                requestId: req.context?.requestId,
                userId: req.user?.id,
            }),
            autoLogging: false,
        })(req, res, next);
    }
};
PinoHttpMiddleware = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [LoggingService])
], PinoHttpMiddleware);
export { PinoHttpMiddleware };
//# sourceMappingURL=pino-http.middleware.js.map