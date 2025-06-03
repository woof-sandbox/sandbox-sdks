export interface PaginationParams {
  cursorValue?: string;
  cursorFieldName: string;
  sortOrder: "asc" | "desc";
  first: string | number;
}
