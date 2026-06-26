import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsNumber, IsOptional, IsString, Min } from "class-validator";

export class AddCartItemDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  productId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  variantId?: string;

  @ApiProperty({ default: 1, minimum: 1 })
  @Transform(({ value }) => Number(value ?? 1))
  @IsNumber()
  @Min(1)
  quantity = 1;
}

export class UpdateCartItemDto {
  @ApiProperty()
  @IsString()
  itemId!: string;

  @ApiProperty({ minimum: 1 })
  @Transform(({ value }) => Number(value))
  @IsNumber()
  @Min(1)
  quantity!: number;
}

export class RemoveCartItemDto {
  @ApiProperty()
  @IsString()
  itemId!: string;
}
