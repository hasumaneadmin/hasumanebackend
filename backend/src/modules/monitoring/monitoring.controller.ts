import { Controller, Get, Header } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Public } from "../../common/decorators/public.decorator.js";
import { MetricsService } from "./metrics.service.js";

@ApiTags("Monitoring")
@Controller({ path: "metrics", version: "1" })
export class MonitoringController {
  constructor(private readonly metricsService: MetricsService) {}

  @Public()
  @Get()
  @Header("Content-Type", "text/plain; version=0.0.4; charset=utf-8")
  async metrics() {
    return this.metricsService.prometheus();
  }
}
