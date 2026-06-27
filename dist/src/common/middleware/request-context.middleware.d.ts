import { NestMiddleware } from "@nestjs/common";
import type { NextFunction, Response } from "express";
import type { AuthenticatedRequest } from "../types/authenticated-request.js";
export declare class RequestContextMiddleware implements NestMiddleware {
    use(req: AuthenticatedRequest, res: Response, next: NextFunction): void;
}
