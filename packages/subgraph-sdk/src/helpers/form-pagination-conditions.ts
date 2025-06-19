import type { PaginationParams } from "../types";

export const formPaginationConditions = (
  pagination: PaginationParams,
): string => {
  let conditions =
    `orderBy: ${pagination.cursorFieldName}, ` +
    `orderDirection: ${pagination.sortOrder}, ` +
    `first: ${pagination.first}`;
  if (pagination.cursorValue !== undefined) {
    const cursorKey = `${pagination.cursorFieldName}${pagination.sortOrder === "asc" ? "_gt" : "_lt"}`;
    conditions += `, ${cursorKey}: "${pagination.cursorValue}"`;
  }

  return conditions;
};
