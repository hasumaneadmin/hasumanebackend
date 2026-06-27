import { MetricsService } from "./metrics.service.js";
export declare class MonitoringController {
    private readonly metricsService;
    constructor(metricsService: MetricsService);
    metrics(): Promise<string>;
}
