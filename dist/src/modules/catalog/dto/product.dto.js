var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { ApiProperty, ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import { Allow, IsBoolean, IsNumber, IsOptional, IsString, Min } from "class-validator";
export class CreateProductDto {
    code;
    name;
    productType;
    categoryId;
    unit;
    price;
    compareAtPrice;
    taxPercent;
    defaultQuantity;
    defaultSchedule;
    description;
    tags;
    isActive;
    sortOrder;
}
__decorate([
    ApiProperty(),
    IsString(),
    __metadata("design:type", String)
], CreateProductDto.prototype, "code", void 0);
__decorate([
    ApiProperty(),
    IsString(),
    __metadata("design:type", String)
], CreateProductDto.prototype, "name", void 0);
__decorate([
    ApiProperty(),
    IsString(),
    __metadata("design:type", String)
], CreateProductDto.prototype, "productType", void 0);
__decorate([
    ApiPropertyOptional(),
    IsOptional(),
    IsString(),
    __metadata("design:type", Object)
], CreateProductDto.prototype, "categoryId", void 0);
__decorate([
    ApiProperty({ default: "unit" }),
    IsString(),
    __metadata("design:type", String)
], CreateProductDto.prototype, "unit", void 0);
__decorate([
    ApiPropertyOptional(),
    IsOptional(),
    IsNumber(),
    Min(0),
    __metadata("design:type", Object)
], CreateProductDto.prototype, "price", void 0);
__decorate([
    ApiPropertyOptional(),
    IsOptional(),
    IsNumber(),
    Min(0),
    __metadata("design:type", Object)
], CreateProductDto.prototype, "compareAtPrice", void 0);
__decorate([
    ApiPropertyOptional(),
    IsOptional(),
    IsNumber(),
    Min(0),
    __metadata("design:type", Object)
], CreateProductDto.prototype, "taxPercent", void 0);
__decorate([
    ApiProperty({ default: 1 }),
    IsNumber(),
    Min(1),
    __metadata("design:type", Number)
], CreateProductDto.prototype, "defaultQuantity", void 0);
__decorate([
    ApiProperty({ default: "daily" }),
    IsString(),
    __metadata("design:type", String)
], CreateProductDto.prototype, "defaultSchedule", void 0);
__decorate([
    ApiPropertyOptional(),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], CreateProductDto.prototype, "description", void 0);
__decorate([
    ApiPropertyOptional(),
    IsOptional(),
    Allow(),
    __metadata("design:type", Object)
], CreateProductDto.prototype, "tags", void 0);
__decorate([
    ApiProperty({ default: true }),
    IsBoolean(),
    __metadata("design:type", Boolean)
], CreateProductDto.prototype, "isActive", void 0);
__decorate([
    ApiPropertyOptional({ default: 0 }),
    IsOptional(),
    IsNumber(),
    Min(0),
    __metadata("design:type", Number)
], CreateProductDto.prototype, "sortOrder", void 0);
export class UpdateProductDto extends PartialType(CreateProductDto) {
}
//# sourceMappingURL=product.dto.js.map