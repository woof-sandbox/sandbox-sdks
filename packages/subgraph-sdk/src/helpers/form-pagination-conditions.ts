import type { PaginationParams } from "../types";

export const formPaginationConditions = (
  pagination: PaginationParams,
): string => {
  let conditions = `orderBy: ${pagination.cursorFieldName}, ` +
      `orderDirection: ${pagination.sortOrder}, ` +
      `first: ${pagination.first}`;
  if (pagination.cursorValue !== undefined) {
    conditions += `${pagination.cursorFieldName}${pagination.sortOrder === "asc" ? "_gt" : "_lt"}: ${pagination.cursorValue}`;
  }

  return conditions
};
