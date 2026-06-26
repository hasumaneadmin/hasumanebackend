import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsDateString, IsIn, IsOptional } from "class-validator";

export class AnalyticsQueryDto {
  @ApiPropertyOptional({ enum: ["daily", "weekly", "monthly", "custom"], default: "monthly" })
  @IsOptional()
  @IsIn(["daily", "weekly", "monthly", "custom"])
  period: "daily" | "weekly" | "monthly" | "custom" = "monthly";

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  to?: string;

  @ApiPropertyOptional({ enum: ["json", "csv", "pdf"], default: "json" })
  @IsOptional()
  @IsIn(["json", "csv", "pdf"])
  format: "json" | "csv" | "pdf" = "json";
}
