import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsEnum, IsString } from "class-validator";
import { Role } from "../../../common/constants/roles.js";

export class UpsertPermissionDto {
  @ApiProperty({ enum: Role })
  @IsEnum(Role)
  role!: Role;

  @ApiProperty()
  @IsString()
  module!: string;

  @ApiProperty()
  @IsBoolean()
  canView!: boolean;

  @ApiProperty()
  @IsBoolean()
  canCreate!: boolean;

  @ApiProperty()
  @IsBoolean()
  canEdit!: boolean;

  @ApiProperty()
  @IsBoolean()
  canDelete!: boolean;

  @ApiProperty()
  @IsBoolean()
  canExport!: boolean;
}
