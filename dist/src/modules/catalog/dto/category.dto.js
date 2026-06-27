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
import { IsBoolean, IsNumber, IsOptional, IsString, Min } from "class-validator";
export class CreateCategoryDto {
    name;
    slug;
    description;
    imageUrl;
    isActive;
    sortOrder;
}
__decorate([
    ApiProperty(),
    IsString(),
    __metadata("design:type", String)
], CreateCategoryDto.prototype, "name", void 0);
__decorate([
    ApiProperty(),
    IsString(),
    __metadata("design:type", String)
], CreateCategoryDto.prototype, "slug", void 0);
__decorate([
    ApiPropertyOptional(),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], CreateCategoryDto.prototype, "description", void 0);
__decorate([
    ApiPropertyOptional(),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], CreateCategoryDto.prototype, "imageUrl", void 0);
__decorate([
    ApiProperty({ default: true }),
    IsBoolean(),
    __metadata("design:type", Boolean)
], CreateCategoryDto.prototype, "isActive", void 0);
__decorate([
    ApiProperty({ default: 0 }),
    IsNumber(),
    Min(0),
    __metadata("design:type", Number)
], CreateCategoryDto.prototype, "sortOrder", void 0);
export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {
}
//# sourceMappingURL=category.dto.js.map