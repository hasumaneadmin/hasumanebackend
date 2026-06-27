export declare class AnalyticsQueryDto {
    period: "daily" | "weekly" | "monthly" | "custom";
    from?: string;
    to?: string;
    format: "json" | "csv" | "pdf";
}
