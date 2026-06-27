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
import { Type } from "class-transformer";
import { ArrayMinSize, IsArray, IsNumber, IsOptional, IsString, Min, ValidateNested, } from "class-validator";
export class CreateOrderItemDto {
    productId;
    variantId;
    quantity;
    unitPrice;
}
__decorate([
    ApiPropertyOptional(),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], CreateOrderItemDto.prototype, "productId", void 0);
__decorate([
    ApiPropertyOptional(),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], CreateOrderItemDto.prototype, "variantId", void 0);
__decorate([
    ApiProperty({ minimum: 1 }),
    IsNumber(),
    Min(1),
    __metadata("design:type", Number)
], CreateOrderItemDto.prototype, "quantity", void 0);
__decorate([
    ApiPropertyOptional({ minimum: 0 }),
    IsOptional(),
    IsNumber(),
    Min(0),
    __metadata("design:type", Number)
], CreateOrderItemDto.prototype, "unitPrice", void 0);
export class CreateOrderDto {
    cartId;
    items;
    taxAmount;
    shippingFee;
    discount;
    currency;
}
__decorate([
    ApiPropertyOptional({ description: "Use a specific active cart. Defaults to the user's active cart." }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], CreateOrderDto.prototype, "cartId", void 0);
__decorate([
    ApiPropertyOptional({ type: [CreateOrderItemDto] }),
    IsOptional(),
    IsArray(),
    ArrayMinSize(1),
    ValidateNested({ each: true }),
    Type(() => CreateOrderItemDto),
    __metadata("design:type", Array)
], CreateOrderDto.prototype, "items", void 0);
__decorate([
    ApiPropertyOptional({ default: 0, minimum: 0 }),
    IsOptional(),
    IsNumber(),
    Min(0),
    __metadata("design:type", Number)
], CreateOrderDto.prototype, "taxAmount", void 0);
__decorate([
    ApiPropertyOptional({ default: 0, minimum: 0 }),
    IsOptional(),
    IsNumber(),
    Min(0),
    __metadata("design:type", Number)
], CreateOrderDto.prototype, "shippingFee", void 0);
__decorate([
    ApiPropertyOptional({ default: 0, minimum: 0 }),
    IsOptional(),
    IsNumber(),
    Min(0),
    __metadata("design:type", Number)
], CreateOrderDto.prototype, "discount", void 0);
__decorate([
    ApiPropertyOptional({ default: "INR" }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], CreateOrderDto.prototype, "currency", void 0);
//# sourceMappingURL=create-order.dto.js.map