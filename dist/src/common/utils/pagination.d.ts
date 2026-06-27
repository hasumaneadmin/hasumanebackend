import type { PaginationQueryDto } from "../dto/pagination-query.dto.js";
export type PaginationMeta = {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
};
export declare function getPagination(query: PaginationQueryDto): {
    page: number;
    limit: number;
    skip: number;
    take: number;
};
export declare function buildPaginationMeta(page: number, limit: number, total: number): PaginationMeta;
