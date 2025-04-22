import { describe, expect, it } from "vitest";
import type { CollectionCallback, CollectionCallbackParams } from "../../src";

describe("types", () => {
  describe("CollectionCallback", () => {
    it("should accept result and params", () => {
      const callback: CollectionCallback = (result, params) => {
        expect(result).toBeDefined();
        expect(params).toBeDefined();
        expect(params.pageSize).toBeDefined();
        expect(params.loopFlag).toBeDefined();
      };

      callback({ data: { items: [] } }, { pageSize: 10, loopFlag: true });
    });
  });

  describe("CollectionCallbackParams", () => {
    it("should have required properties", () => {
      const params: CollectionCallbackParams = {
        pageSize: 10,
        loopFlag: true,
      };

      expect(params.pageSize).toBe(10);
      expect(params.loopFlag).toBe(true);
    });
  });
});
