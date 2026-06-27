import { Role } from "../../../common/constants/roles.js";
export declare class RegisterDto {
    name: string;
    email: string;
    phone: string;
    password: string;
    role: Role;
}
export declare class UpdateProfileDto {
    name?: string;
    phone?: string;
}
