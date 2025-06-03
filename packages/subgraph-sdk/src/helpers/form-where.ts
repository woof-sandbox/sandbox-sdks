export const formWhere = (
  whereFilters: Record<string, string | string[]>,
): string => {
  let where = "";
  if (Object.keys(whereFilters).length) {
    where += "{ ";

    for (const [key, val] of Object.entries(whereFilters)) {
      if (Array.isArray(val)) {
        where += `${key}: [${val.map((v) => `"${v}"`).join(", ")}]`;
      } else if (val.startsWith("{") && val.endsWith("}")) {
        where += `${key}: ${val}`;
      } else {
        where += `${key}: "${val}"`;
      }
      where += ", ";
    }
    where = where.slice(0, -2);
    where += " }";
  }

  return where;
};
