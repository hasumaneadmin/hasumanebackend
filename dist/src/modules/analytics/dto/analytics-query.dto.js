var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsDateString, IsIn, IsOptional } from "class-validator";
export class AnalyticsQueryDto {
    period = "monthly";
    from;
    to;
    format = "json";
}
__decorate([
    ApiPropertyOptional({ enum: ["daily", "weekly", "monthly", "custom"], default: "monthly" }),
    IsOptional(),
    IsIn(["daily", "weekly", "monthly", "custom"]),
    __metadata("design:type", String)
], AnalyticsQueryDto.prototype, "period", void 0);
__decorate([
    ApiPropertyOptional(),
    IsOptional(),
    IsDateString(),
    __metadata("design:type", String)
], AnalyticsQueryDto.prototype, "from", void 0);
__decorate([
    ApiPropertyOptional(),
    IsOptional(),
    IsDateString(),
    __metadata("design:type", String)
], AnalyticsQueryDto.prototype, "to", void 0);
__decorate([
    ApiPropertyOptional({ enum: ["json", "csv", "pdf"], default: "json" }),
    IsOptional(),
    IsIn(["json", "csv", "pdf"]),
    __metadata("design:type", String)
], AnalyticsQueryDto.prototype, "format", void 0);
//# sourceMappingURL=analytics-query.dto.js.map