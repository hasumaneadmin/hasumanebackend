import { Global, Module } from "@nestjs/common";
import { PrismaModule } from "../../prisma/prisma.module.js";
import { LoggingController } from "./logging.controller.js";
import { LoggingService } from "./logging.service.js";
import { PinoHttpMiddleware } from "./pino-http.middleware.js";

@Global()
@Module({
  imports: [PrismaModule],
  controllers: [LoggingController],
  providers: [LoggingService, PinoHttpMiddleware],
  exports: [LoggingService, PinoHttpMiddleware],
})
export class LoggingModule {}
