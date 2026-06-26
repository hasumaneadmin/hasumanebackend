import { ApiProperty } from "@nestjs/swagger";
import { IsObject } from "class-validator";

export class ResourceWriteDto {
  @ApiProperty({ type: Object })
  @IsObject()
  data!: Record<string, unknown>;
}
