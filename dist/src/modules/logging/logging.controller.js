var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { Controller, Get, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Role } from "../../common/constants/roles.js";
import { Roles } from "../../common/decorators/roles.decorator.js";
import { LogQueryDto } from "./dto/log-query.dto.js";
import { LoggingService } from "./logging.service.js";
let LoggingController = class LoggingController {
    loggingService;
    constructor(loggingService) {
        this.loggingService = loggingService;
    }
    list(query) {
        return this.loggingService.list(query);
    }
};
__decorate([
    Get(),
    ApiOperation({ summary: "Search structured application, API, security, and error logs." }),
    __param(0, Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [LogQueryDto]),
    __metadata("design:returntype", void 0)
], LoggingController.prototype, "list", null);
LoggingController = __decorate([
    ApiBearerAuth(),
    ApiTags("Logs"),
    Roles(Role.ADMIN),
    Controller({ path: "logs", version: "1" }),
    __metadata("design:paramtypes", [LoggingService])
], LoggingController);
export { LoggingController };
//# sourceMappingURL=logging.controller.js.map