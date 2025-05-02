import { describe, it, expect, vi } from "vitest";
import { UserMarketMethods } from "../../src/user/UserMarketMethods";
import { DataUtils, UserCollateral, PRICE_FEED_FACTOR_UNITS } from "../../src";
import { MISSING_COLLATERAL_DATA } from "../../src/errors/methods/user-market-methods.errors";

const mockAddress1 = "0xToken1" as `0x${string}`;
const mockAddress2 = "0xToken2" as `0x${string}`;

const mockCollateral = (data = {}) => new UserCollateral({
  tokenAddress: mockAddress1,
  symbol: "ETH",
  decimals: BigInt(18),
  price: "2000",
  priceFeedAddress: "0xFeed",
  userBalance: 0n,
  userSupplyBalance: [DataUtils.toBigNumber("1", 18)],
  totalSupplyAsset: [0n],
  collateralReserves: 0n,
  cometBalance: 0n,
  collateralFactor: BigInt("500000000000000000"),
  liquidationFactor: BigInt("700000000000000000"),
  liquidationPenalty: BigInt("250000000000000000"),
  supplyCap: BigInt("100000000000000000000000"),
  ...data,
});

const mockCustomCollateral = ({ address = mockAddress1, value = "0.5" } = {}) => ({ address, value });
const mockAllowance = ({ tokenAddress = mockAddress1, inputAmount = "1", allowance = DataUtils.toBigNumber("1", 18) } = {}) => ({ tokenAddress, inputAmount, allowance });
const mockCall = ({ tokenAddress = mockAddress1, inputAmount = "1" } = {}) => ({ tokenAddress, inputAmount });
const mockBaseToken = {
  tokenAddress: "0xBase" as `0x${string}`,
  symbol: "USDC",
  decimals: BigInt(6),
  price: "1",
  priceFeedAddress: "0xFeed",
  baseMinBorrow: 0n,
  baseMinForRewards: 0n,
  baseTrackingBorrowSpeed: 0n,
  baseTrackingSupplySpeed: 0n,
  baseIndexScale: 1n,
  curvePresets: [],
};
const mockCompToken = { tokenAddress: "0xComp" as `0x${string}`, symbol: "COMP", decimals: BigInt(18), price: "50", priceFeedAddress: "0xFeed" };
const mockRewardToken = { tokenAddress: "0xReward" as `0x${string}`, symbol: "RWD", decimals: BigInt(18), price: "2", priceFeedAddress: "0xFeed" };

vi.mock("../../src/market/MarketMethods", () => ({
  MarketMethods: {
    netBorrowAprs: vi.fn(() => [1, 2, 3]),
  },
}));


describe("UserMarketMethods", () => {
  it("borrowBalanceUsd: counts correctly $", () => {
    const borrow = DataUtils.toBigNumber("2", 6);
    expect(UserMarketMethods.borrowBalanceUsd(borrow, BigInt(6), "1.5")).toBeCloseTo(3);
  });

  it("supplyBalanceUsd: counts correctly $", () => {
    const supply = DataUtils.toBigNumber("3", 6);
    expect(UserMarketMethods.supplyBalanceUsd(supply, BigInt(6), "2")).toBeCloseTo(6);
  });

  it("tokenPrice: counts correctly for USD and non-USD", () => {
    const price = DataUtils.toBigNumber("2000", PRICE_FEED_FACTOR_UNITS);
    expect(UserMarketMethods.tokenPrice("USDC", price, "1")).toBeCloseTo(2000);
    expect(UserMarketMethods.tokenPrice("ETH", price, "2")).toBeCloseTo(4000);
  });

  it("borrowCollateralValueUSD: counts the sum of all collaterals", () => {
    const collaterals = [mockCollateral(), mockCollateral({ tokenAddress: mockAddress2, symbol: "USDC", price: "1" })];
    expect(UserMarketMethods.borrowCollateralValueUSD(collaterals, "1")).toBeGreaterThan(0);
  });

  it("borrowCollateralValueCustomUsd: honors customCollaterals", () => {
    const collaterals = [mockCollateral()];
    const customCollaterals = [mockCustomCollateral({ value: "2" })];
    expect(UserMarketMethods.borrowCollateralValueCustomUsd(collaterals, customCollaterals, "1")).toBeGreaterThan(0);
  });

  it("borrowCapacityMarketUsd: counts the limit across all collaterals", () => {
    const collaterals = [mockCollateral()];
    expect(UserMarketMethods.borrowCapacityMarketUsd(collaterals, "1")).toBeGreaterThan(0);
  });

  it("borrowCapacityMarketCustomUsd: honors customCollaterals", () => {
    const collaterals = [mockCollateral()];
    const customCollaterals = [mockCustomCollateral({ value: "2" })];
    expect(UserMarketMethods.borrowCapacityMarketCustomUsd(collaterals, customCollaterals, "1")).toBeGreaterThan(0);
  });

  it("maxWithdrawCollateralAmount: returns supplyAmount if there is no debt", () => {
    const supply = DataUtils.toBigNumber("5", 6);
    expect(UserMarketMethods.maxWithdrawCollateralAmount(100, supply, 0n, BigInt(6), "1")).toBe("5");
  });

  it("maxWithdrawCollateralAmount: returns the available withdrawal if there is a debt", () => {
    const supply = DataUtils.toBigNumber("5", 6);
    const borrow = DataUtils.toBigNumber("2", 6);
    expect(Number(UserMarketMethods.maxWithdrawCollateralAmount(10, supply, borrow, BigInt(6), "1"))).toBeCloseTo(8);
  });

  it("findMarketCollateralByAddress: finds by address", () => {
    const collaterals = [mockCollateral({ tokenAddress: mockAddress1 }), mockCollateral({ tokenAddress: mockAddress2 })];
    expect(UserMarketMethods.findMarketCollateralByAddress(mockAddress2, collaterals)).toBeDefined();
  });

  it("isSomeTokenAllowanceTooSmall: true if allowance is less than inputAmount", () => {
    const collaterals = [mockCollateral({ decimals: BigInt(18) })];
    const allowances = [mockAllowance({ inputAmount: "2", allowance: DataUtils.toBigNumber("1", 18) })];
    expect(UserMarketMethods.isSomeTokenAllowanceTooSmall(collaterals, allowances)).toBe(true);
  });

  it("isSomeTokenAllowanceTooSmall: false if the allowance is sufficient", () => {
    const collaterals = [mockCollateral({ decimals: BigInt(18) })];
    const allowances = [mockAllowance({ inputAmount: "1", allowance: DataUtils.toBigNumber("2", 18) })];
    expect(UserMarketMethods.isSomeTokenAllowanceTooSmall(collaterals, allowances)).toBe(false);
  });

  it("isSomeTokenAllowanceTooSmall: throws error if collateral is not found", () => {
    const collaterals = [mockCollateral({ tokenAddress: mockAddress1 })];
    const allowances = [mockAllowance({ tokenAddress: mockAddress2 })];
    expect(() => UserMarketMethods.isSomeTokenAllowanceTooSmall(collaterals, allowances)).toThrow(MISSING_COLLATERAL_DATA().message);
  });

  it("isAllCollateralsFromMarket: true if everything is available", () => {
    const collaterals = [mockCollateral({ tokenAddress: mockAddress1 }), mockCollateral({ tokenAddress: mockAddress2 })];
    const calls = [mockCall({ tokenAddress: mockAddress1 }), mockCall({ tokenAddress: mockAddress2 })];
    expect(UserMarketMethods.isAllCollateralsFromMarket(collaterals, calls)).toBe(true);
  });

  it("isAllCollateralsFromMarket: false if not all are available", () => {
    const collaterals = [mockCollateral({ tokenAddress: mockAddress1 })];
    const calls = [mockCall({ tokenAddress: mockAddress1 }), mockCall({ tokenAddress: mockAddress2 })];
    expect(UserMarketMethods.isAllCollateralsFromMarket(collaterals, calls)).toBe(false);
  });

  it("availableToBorrow: considers available for borrowing", () => {
    const collaterals = [
      mockCollateral({
        userSupplyBalance: [DataUtils.toBigNumber("10", 18)],
        collateralFactor: BigInt("1000000000000000000"),
      }),
    ];
    const borrow = DataUtils.toBigNumber("1", 18);
    expect(Number(UserMarketMethods.availableToBorrow(collaterals, "1", borrow))).toBeGreaterThanOrEqual(0);
  });

  it("netBorrowAprsCustom: delegates to MarketMethods.netBorrowAprs", () => {
    const result = UserMarketMethods.netBorrowAprsCustom("1", mockBaseToken, 1n, mockCompToken, [mockRewardToken], 0.1);
    expect(result).toEqual([1, 2, 3]);
  });
});
