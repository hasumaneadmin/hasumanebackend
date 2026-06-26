import { Injectable, NestMiddleware } from "@nestjs/common";
import { pinoHttp } from "pino-http";
import type { NextFunction, Response } from "express";
import { randomUUID } from "node:crypto";
import type { AuthenticatedRequest } from "../../common/types/authenticated-request.js";
import { LoggingService } from "./logging.service.js";

@Injectable()
export class PinoHttpMiddleware implements NestMiddleware {
  constructor(private readonly loggingService: LoggingService) {}

  use(req: AuthenticatedRequest, res: Response, next: NextFunction) {
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
}
