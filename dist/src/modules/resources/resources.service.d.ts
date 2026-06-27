import { PaginationQueryDto } from "../../common/dto/pagination-query.dto.js";
import type { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { PrismaService } from "../../prisma/prisma.service.js";
export declare class ResourcesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    list(resourceKey: string, query: PaginationQueryDto, user: AuthenticatedUser): Promise<{
        success: boolean;
        message: string;
        data: unknown[];
        meta: import("../../common/utils/pagination.js").PaginationMeta;
    }>;
    findOne(resourceKey: string, id: string, user: AuthenticatedUser): Promise<{}>;
    create(resourceKey: string, data: Record<string, unknown>, user: AuthenticatedUser): Promise<unknown>;
    update(resourceKey: string, id: string, data: Record<string, unknown>, user: AuthenticatedUser): Promise<unknown>;
    remove(resourceKey: string, id: string, user: AuthenticatedUser): Promise<unknown>;
    private getConfig;
    private getDelegate;
    private buildWhere;
    private withSoftDelete;
    private parseFilters;
    private assertRole;
    private ensureExists;
    private audit;
}
