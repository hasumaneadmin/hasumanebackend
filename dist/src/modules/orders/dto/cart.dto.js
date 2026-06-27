var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsNumber, IsOptional, IsString, Min } from "class-validator";
export class AddCartItemDto {
    productId;
    variantId;
    quantity = 1;
}
__decorate([
    ApiPropertyOptional(),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], AddCartItemDto.prototype, "productId", void 0);
__decorate([
    ApiPropertyOptional(),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], AddCartItemDto.prototype, "variantId", void 0);
__decorate([
    ApiProperty({ default: 1, minimum: 1 }),
    Transform(({ value }) => Number(value ?? 1)),
    IsNumber(),
    Min(1),
    __metadata("design:type", Object)
], AddCartItemDto.prototype, "quantity", void 0);
export class UpdateCartItemDto {
    itemId;
    quantity;
}
__decorate([
    ApiProperty(),
    IsString(),
    __metadata("design:type", String)
], UpdateCartItemDto.prototype, "itemId", void 0);
__decorate([
    ApiProperty({ minimum: 1 }),
    Transform(({ value }) => Number(value)),
    IsNumber(),
    Min(1),
    __metadata("design:type", Number)
], UpdateCartItemDto.prototype, "quantity", void 0);
export class RemoveCartItemDto {
    itemId;
}
__decorate([
    ApiProperty(),
    IsString(),
    __metadata("design:type", String)
], RemoveCartItemDto.prototype, "itemId", void 0);
//# sourceMappingURL=cart.dto.js.map