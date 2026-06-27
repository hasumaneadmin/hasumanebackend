import { NestMiddleware } from "@nestjs/common";
import type { NextFunction, Response } from "express";
import type { AuthenticatedRequest } from "../../common/types/authenticated-request.js";
import { LoggingService } from "./logging.service.js";
export declare class PinoHttpMiddleware implements NestMiddleware {
    private readonly loggingService;
    constructor(loggingService: LoggingService);
    use(req: AuthenticatedRequest, res: Response, next: NextFunction): void;
}
