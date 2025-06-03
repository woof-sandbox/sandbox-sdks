import type { PaginationParams } from "../types/pagination-params";

export const formPaginationConditions = (
  pagination: PaginationParams,
): string => {
  return (
    `${pagination.cursorFieldName}${pagination.sortOrder === "asc" ? "_gt" : "_lt"}: ${pagination.cursorValue}` +
    `orderBy: ${pagination.cursorFieldName}, ` +
    `orderDirection: ${pagination.sortOrder}, ` +
    `first: ${pagination.first}`
  );
};
