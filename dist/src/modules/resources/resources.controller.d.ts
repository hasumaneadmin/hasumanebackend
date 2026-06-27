import { PaginationQueryDto } from "../../common/dto/pagination-query.dto.js";
import type { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { ResourceWriteDto } from "./dto/resource-write.dto.js";
import { ResourcesService } from "./resources.service.js";
export declare class ResourcesController {
    private readonly resourcesService;
    constructor(resourcesService: ResourcesService);
    list(resource: string, query: PaginationQueryDto, user: AuthenticatedUser): Promise<{
        success: boolean;
        message: string;
        data: unknown[];
        meta: import("../../common/utils/pagination.js").PaginationMeta;
    }>;
    findOne(resource: string, id: string, user: AuthenticatedUser): Promise<{}>;
    create(resource: string, dto: ResourceWriteDto, user: AuthenticatedUser): Promise<unknown>;
    update(resource: string, id: string, dto: ResourceWriteDto, user: AuthenticatedUser): Promise<unknown>;
    remove(resource: string, id: string, user: AuthenticatedUser): Promise<unknown>;
}
