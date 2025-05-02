import { ethers } from "ethers";
import { describe, expect, test } from "vitest";
import { DataUtils } from "../../src";

describe("DataUtils", () => {
  test("parseTokenInput", () => {
    expect(DataUtils.parseTokenInput("1,000.000")).toBe("1000.000");
    expect(DataUtils.parseTokenInput("  42.300 ")).toBe("42.300");
  });

  test("validateNumericInput", () => {
    expect(DataUtils.validateNumericInput("123.45")).toBe(true);
    expect(DataUtils.validateNumericInput("abc")).toBe(false);
    expect(DataUtils.validateNumericInput("0.000123")).toBe(true);
    expect(DataUtils.validateNumericInput("-987654")).toBe(true);
  });

  test("toBigNumber", () => {
    expect(DataUtils.toBigNumber("1.5", 18)).toEqual(
      ethers.parseUnits("1.5", 18),
    );
    expect(DataUtils.toBigNumber("0.00001234", 18)).toEqual(
      ethers.parseUnits("0.00001234", 18),
    );
  });

  test("fromBigNumber", () => {
    expect(DataUtils.fromBigNumber(ethers.parseUnits("1.5", 18), 18)).toBe(
      "1.5",
    );
    expect(
      DataUtils.fromBigNumber(ethers.parseUnits("123456789.987654321", 18), 18),
    ).toBe("123456789.987654321");
  });
});
