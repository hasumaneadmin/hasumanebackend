import { PaginationQueryDto } from "../../../common/dto/pagination-query.dto.js";
export declare class AuditLogQueryDto extends PaginationQueryDto {
    userId?: string;
    action?: string;
    entityType?: string;
    module?: string;
    from?: string;
    to?: string;
}
