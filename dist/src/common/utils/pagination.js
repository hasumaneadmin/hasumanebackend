export function getPagination(query) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 20));
    return {
        page,
        limit,
        skip: (page - 1) * limit,
        take: limit,
    };
}
export function buildPaginationMeta(page, limit, total) {
    const totalPages = Math.max(1, Math.ceil(total / limit));
    return {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
    };
}
//# sourceMappingURL=pagination.js.map