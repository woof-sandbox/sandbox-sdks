import { describe, expect, test } from "vitest";
import { FormattingUtils } from "../../src/utils";

describe("FormattingUtils", () => {
  test("formatTokenValue", () => {
    expect(FormattingUtils.formatTokenValue(1000n, 3)).toBe("1.0");
    expect(FormattingUtils.formatTokenValue(1234567890123456789n, 18)).toBe("1.234567890123456789");
    expect(FormattingUtils.formatTokenValue(5000000000000000000n, 18)).toBe("5.0");
    expect(FormattingUtils.formatTokenValue(1000000000n, 6)).toBe("1000.0");
  });

  test("formatNumber", () => {
    expect(FormattingUtils.formatNumber(123456.789, 2)).toBe("123,456.79");
    expect(FormattingUtils.formatNumber(0.00001234, 8)).toBe("0.00001234");
  });

  test("formatCurrency", () => {
    expect(FormattingUtils.formatCurrency(1234.56, "$")).toBe("$1,234.56");
    expect(FormattingUtils.formatCurrency(987654321.123, "€")).toBe("€987,654,321.12");
  });

  test("sliceAddress", () => {
    expect(FormattingUtils.sliceAddress("0x1234567890abcdef1234567890abcdef12345678")).toBe("0x1234...5678");
    expect(FormattingUtils.sliceAddress("0x9876543210abcdef9876543210abcdef98765432")).toBe("0x9876...5432");
  });

  test("formatPercentage", () => {
    expect(FormattingUtils.formatPercentage(0.1234, 2)).toBe("12.34%");
    expect(FormattingUtils.formatPercentage(0.00005678, 6)).toBe("0.005678%");
  });
});
