import { PaginationQueryDto } from "../../common/dto/pagination-query.dto.js";
import type { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { CreateUserDto } from "./dto/create-user.dto.js";
import { UpdateUserDto } from "./dto/update-user.dto.js";
import { UsersService } from "./users.service.js";
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    findAll(query: PaginationQueryDto): Promise<{
        data: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            email: string | null;
            role: string;
            phone: string;
            emailVerifiedAt: Date | null;
            twoFactorEnabled: boolean;
            isBlocked: boolean;
            lastLoginAt: Date | null;
        }[];
        meta: import("../../common/utils/pagination.js").PaginationMeta;
    }>;
    findOne(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        email: string | null;
        role: string;
        phone: string;
        emailVerifiedAt: Date | null;
        twoFactorEnabled: boolean;
        isBlocked: boolean;
        lastLoginAt: Date | null;
        addresses: {
            id: string;
            userId: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            createdBy: string | null;
            updatedBy: string | null;
            isActive: boolean;
            streetAddress: string;
            pincode: string;
            latitude: import("@prisma/client/runtime/library").Decimal;
            longitude: import("@prisma/client/runtime/library").Decimal;
        }[];
        sessions: {
            id: string;
            ipAddress: string | null;
            userAgent: string | null;
            expiresAt: Date;
            createdAt: Date;
        }[];
    }>;
    create(dto: CreateUserDto, actor: AuthenticatedUser): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        email: string | null;
        role: string;
        phone: string;
        emailVerifiedAt: Date | null;
        twoFactorEnabled: boolean;
        isBlocked: boolean;
        lastLoginAt: Date | null;
    }>;
    update(id: string, dto: UpdateUserDto, actor: AuthenticatedUser): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        email: string | null;
        role: string;
        phone: string;
        emailVerifiedAt: Date | null;
        twoFactorEnabled: boolean;
        isBlocked: boolean;
        lastLoginAt: Date | null;
    }>;
    block(id: string, actor: AuthenticatedUser): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        email: string | null;
        role: string;
        phone: string;
        emailVerifiedAt: Date | null;
        twoFactorEnabled: boolean;
        isBlocked: boolean;
        lastLoginAt: Date | null;
    }>;
    unblock(id: string, actor: AuthenticatedUser): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        email: string | null;
        role: string;
        phone: string;
        emailVerifiedAt: Date | null;
        twoFactorEnabled: boolean;
        isBlocked: boolean;
        lastLoginAt: Date | null;
    }>;
    remove(id: string, actor: AuthenticatedUser): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        email: string | null;
        role: string;
        phone: string;
        emailVerifiedAt: Date | null;
        twoFactorEnabled: boolean;
        isBlocked: boolean;
        lastLoginAt: Date | null;
    }>;
}
