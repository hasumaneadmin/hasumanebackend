import { CreateUserDto } from "./create-user.dto.js";
declare const UpdateUserDto_base: import("@nestjs/common").Type<Partial<CreateUserDto>>;
export declare class UpdateUserDto extends UpdateUserDto_base {
    isBlocked?: boolean;
}
export {};
