import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsIn, IsNumber, IsOptional, IsString, Min } from "class-validator";

export class StockAdjustmentDto {
  @ApiProperty({ enum: ["in", "out", "adjustment", "reserved", "released"] })
  @IsIn(["in", "out", "adjustment", "reserved", "released"])
  movementType!: "in" | "out" | "adjustment" | "reserved" | "released";

  @ApiProperty({ minimum: 0 })
  @IsNumber()
  @Min(0)
  quantity!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  referenceType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  referenceId?: string;
}
