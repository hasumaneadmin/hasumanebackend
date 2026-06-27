var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Global, Module } from "@nestjs/common";
import { PrismaModule } from "../../prisma/prisma.module.js";
import { LoggingController } from "./logging.controller.js";
import { LoggingService } from "./logging.service.js";
import { PinoHttpMiddleware } from "./pino-http.middleware.js";
let LoggingModule = class LoggingModule {
};
LoggingModule = __decorate([
    Global(),
    Module({
        imports: [PrismaModule],
        controllers: [LoggingController],
        providers: [LoggingService, PinoHttpMiddleware],
        exports: [LoggingService, PinoHttpMiddleware],
    })
], LoggingModule);
export { LoggingModule };
//# sourceMappingURL=logging.module.js.map