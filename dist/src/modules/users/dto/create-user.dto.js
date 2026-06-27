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
import { IsEmail, IsEnum, IsOptional, IsPhoneNumber, IsString, MinLength } from "class-validator";
import { Role } from "../../../common/constants/roles.js";
export class CreateUserDto {
    name;
    email;
    phone;
    password;
    role;
}
__decorate([
    ApiProperty(),
    IsString(),
    MinLength(2),
    __metadata("design:type", String)
], CreateUserDto.prototype, "name", void 0);
__decorate([
    ApiProperty(),
    IsEmail(),
    __metadata("design:type", String)
], CreateUserDto.prototype, "email", void 0);
__decorate([
    ApiProperty(),
    IsPhoneNumber("IN"),
    __metadata("design:type", String)
], CreateUserDto.prototype, "phone", void 0);
__decorate([
    ApiPropertyOptional({ minLength: 10 }),
    IsOptional(),
    IsString(),
    MinLength(10),
    __metadata("design:type", String)
], CreateUserDto.prototype, "password", void 0);
__decorate([
    ApiProperty({ enum: Role }),
    IsEnum(Role),
    __metadata("design:type", String)
], CreateUserDto.prototype, "role", void 0);
//# sourceMappingURL=create-user.dto.js.map