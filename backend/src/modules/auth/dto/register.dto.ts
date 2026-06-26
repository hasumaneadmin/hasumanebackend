import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsEnum, IsOptional, IsPhoneNumber, IsString, MinLength } from "class-validator";
import { Role } from "../../../common/constants/roles.js";

export class RegisterDto {
  @ApiProperty()
  @IsString()
  @MinLength(2)
  name!: string;

  @ApiProperty()
  @IsEmail()
  email!: string;

  @ApiProperty()
  @IsPhoneNumber("IN")
  phone!: string;

  @ApiProperty({ minLength: 10 })
  @IsString()
  @MinLength(10)
  password!: string;

  @ApiProperty({ enum: Role, default: Role.CUSTOMER })
  @IsOptional()
  @IsEnum(Role)
  role: Role = Role.CUSTOMER;
}

export class UpdateProfileDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @ApiProperty()
  @IsOptional()
  @IsPhoneNumber("IN")
  phone?: string;
}
