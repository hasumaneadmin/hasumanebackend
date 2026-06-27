import { Role } from "../../../common/constants/roles.js";
export declare class CreateUserDto {
    name: string;
    email: string;
    phone: string;
    password?: string;
    role: Role;
}
