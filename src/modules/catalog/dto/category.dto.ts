import { ApiProperty, ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import { IsBoolean, IsNumber, IsOptional, IsString, Min } from "class-validator";

export class CreateCategoryDto {
  @ApiProperty()
  @IsString()
  name!: string;

  @ApiProperty()
  @IsString()
  slug!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiProperty({ default: true })
  @IsBoolean()
  isActive!: boolean;

  @ApiProperty({ default: 0 })
  @IsNumber()
  @Min(0)
  sortOrder!: number;
}

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {}
