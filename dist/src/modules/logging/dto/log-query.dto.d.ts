import { PaginationQueryDto } from "../../../common/dto/pagination-query.dto.js";
export declare class LogQueryDto extends PaginationQueryDto {
    severity?: string;
    module?: string;
    category?: string;
    from?: string;
    to?: string;
}
