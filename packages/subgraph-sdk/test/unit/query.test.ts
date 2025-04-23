import { describe, expect, it } from "vitest";
import type { CollectionQuery } from "../../src/query";

describe("CollectionQuery", () => {
  it("should accept number parameters", () => {
    const query: CollectionQuery = (
      skip: number | string,
      pageSize: number | string,
    ) => `query { items(skip: ${skip}, first: ${pageSize}) { id } }`;

    expect(query(0, 10)).toBe("query { items(skip: 0, first: 10) { id } }");
  });

  it("should accept string parameters", () => {
    const query: CollectionQuery = (
      skip: number | string,
      pageSize: number | string,
    ) => `query { items(skip: ${skip}, first: ${pageSize}) { id } }`;

    expect(query("0", "10")).toBe("query { items(skip: 0, first: 10) { id } }");
  });
});
