import { Controller, Get, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Role } from "../../common/constants/roles.js";
import { Roles } from "../../common/decorators/roles.decorator.js";
import { LogQueryDto } from "./dto/log-query.dto.js";
import { LoggingService } from "./logging.service.js";

@ApiBearerAuth()
@ApiTags("Logs")
@Roles(Role.ADMIN)
@Controller({ path: "logs", version: "1" })
export class LoggingController {
  constructor(private readonly loggingService: LoggingService) {}

  @Get()
  @ApiOperation({ summary: "Search structured application, API, security, and error logs." })
  list(@Query() query: LogQueryDto) {
    return this.loggingService.list(query);
  }
}
