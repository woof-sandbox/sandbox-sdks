import { beforeEach, describe, expect, it } from "vitest";
import { MarketRatesService } from "../../src/services/market-rates";

const rpcUrl = "https://rpc.test.com";
let service: MarketRatesService;

beforeEach(() => {
  service = new MarketRatesService(rpcUrl);
});

describe("MarketRatesService", () => {
  it("should calculate supply APR correctly", () => {
    const supplyRate = BigInt(1e8);
    const baseDecimal = 18;
    const result = (service as any).calcSupplyApr(supplyRate, baseDecimal);
    expect(result).toBeGreaterThan(0);
  });

  it("should calculate borrow APR correctly", () => {
    const borrowRate = BigInt(1e8);
    const baseDecimal = 18;
    const result = (service as any).calcBorrowApr(borrowRate, baseDecimal);
    expect(result).toBeGreaterThan(0);
  });

  it("should calculate supply COMP reward APR correctly", () => {
    const result = (service as any).calcSupplyCompRewardApr(10, 5, 1000, 1);
    expect(result).toBeCloseTo(1825, 2);
  });

  it("should calculate borrow COMP reward APR correctly", () => {
    const result = (service as any).calcBorrowCompRewardApr(10, 5, 1000, 1);
    expect(result).toBeCloseTo(1825, 2);
  });

  it("should calculate net borrow APY correctly", () => {
    const result = (service as any).calcNetBorrowAPY(10, 5);
    expect(result).toBe(5);
  });

  it("should calculate net earn APY correctly", () => {
    const result = (service as any).calcNetEarnAPY(10, 5);
    expect(result).toBe(15);
  });

  it("should calculate total earning WETH correctly", () => {
    const result = (service as any).calcTotalEarningWeth(100, 2000);
    expect(result).toBe(200000);
  });

  it("should calculate total borrowed WETH correctly", () => {
    const result = (service as any).calcTotalBorrowedWeth(50, 2000);
    expect(result).toBe(100000);
  });

  it("should calculate total all correctly", () => {
    const result = (service as any).calcTotalAll(200000, 100000);
    expect(result).toBe(300000);
  });

  it("should calculate token price correctly", () => {
    const result = (service as any).calcTokenPrice("ETH", 1e8, 2000);
    expect(result).toBeCloseTo(2000, 2);
  });

  it("should calculate health factor correctly", () => {
    const result = (service as any).calcHealthFactor(10000, 5000, 1.5);
    expect(result).toBe(3);
  });
});
