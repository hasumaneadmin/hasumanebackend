import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString, MinLength } from "class-validator";

export class CreateAdminSessionDto {
  @ApiProperty({ description: "Admin access token for the operations console." })
  @IsString()
  @MinLength(1)
  password!: string;

  @ApiPropertyOptional({ description: "Requested workspace role from the admin UI." })
  @IsOptional()
  @IsString()
  role?: string;
}
