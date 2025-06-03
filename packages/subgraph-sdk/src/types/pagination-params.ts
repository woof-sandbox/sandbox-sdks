export interface PaginationParams {
  cursorFieldName: string;
  cursorValue: string;
  sortOrder: "asc" | "desc";
  first: string | number;
}
