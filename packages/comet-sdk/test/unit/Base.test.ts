import { describe, expect, it } from "vitest";
import { Base, type IBase } from "../../src/token/base";

const mockBaseData: IBase = {
  tokenAddress: "0xBase",
  symbol: "BASE",
  priceFeedDecimals: 18n,
  price: "1.0",
  priceFeedAddress: "0xFeed",
  baseMinForRewards: 200n,
  baseTrackingBorrowSpeed: 300n,
  baseTrackingSupplySpeed: 400n,
  baseIndexScale: 500n,
  curvePresets: [],
};

describe("Base", () => {
  it("should assign all properties from constructor and inherit from Token", () => {
    const base = new Base(mockBaseData);
    expect(base.tokenAddress).toBe(mockBaseData.tokenAddress);
    expect(base.symbol).toBe(mockBaseData.symbol);
    expect(base.priceFeedDecimals).toBe(mockBaseData.priceFeedDecimals);
    expect(base.price).toBe(mockBaseData.price);
    expect(base.priceFeedAddress).toBe(mockBaseData.priceFeedAddress);
    expect(base.baseMinForRewards).toBe(mockBaseData.baseMinForRewards);
    expect(base.baseTrackingBorrowSpeed).toBe(
      mockBaseData.baseTrackingBorrowSpeed,
    );
    expect(base.baseTrackingSupplySpeed).toBe(
      mockBaseData.baseTrackingSupplySpeed,
    );
    expect(base.baseIndexScale).toBe(mockBaseData.baseIndexScale);
    expect(base.curvePresets).toBe(mockBaseData.curvePresets);
  });
});
