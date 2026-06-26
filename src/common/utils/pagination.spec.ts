import { buildPaginationMeta, getPagination } from "./pagination.js";

describe("pagination utilities", () => {
  it("normalizes pagination bounds", () => {
    expect(getPagination({ page: 0, limit: 999, sortOrder: "desc" })).toEqual({
      page: 1,
      limit: 100,
      skip: 0,
      take: 100,
    });
  });

  it("builds complete metadata", () => {
    expect(buildPaginationMeta(2, 10, 25)).toEqual({
      page: 2,
      limit: 10,
      total: 25,
      totalPages: 3,
      hasNextPage: true,
      hasPreviousPage: true,
    });
  });
});
