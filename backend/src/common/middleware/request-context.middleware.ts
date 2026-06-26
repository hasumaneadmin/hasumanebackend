import { Injectable, NestMiddleware } from "@nestjs/common";
import type { NextFunction, Response } from "express";
import { randomUUID } from "node:crypto";
import type { AuthenticatedRequest } from "../types/authenticated-request.js";

@Injectable()
export class RequestContextMiddleware implements NestMiddleware {
  use(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    const requestId = req.header("x-request-id") || randomUUID();
    req.context = {
      requestId,
      ipAddress: req.ip,
      userAgent: req.header("user-agent"),
    };
    res.setHeader("x-request-id", requestId);
    next();
  }
}
