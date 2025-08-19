import { beforeEach, describe, expect, it, vi } from "vitest";
import type { IMarket } from "../../src/market/IMarket";
import type { IMarketInterestRateModel } from "../../src/market/IMarketInterestRateModel";
import { Market } from "../../src/market/Market";
import { MarketMethods } from "../../src/market/MarketMethods";
import type { IToken } from "../../src/token/IToken";
import type { IBase } from "../../src/token/base/IBase";
import { Collateral } from "../../src/token/collateral/Collateral";
import type { ICollateral } from "../../src/token/collateral/ICollateral";

const mockCurve = {
  id: "curve1",
  supplyKink: 80n,
  supplyPerYearInterestRateSlopeLow: 10n,
  supplyPerYearInterestRateSlopeHigh: 20n,
  supplyPerYearInterestRateBase: 2n,
  borrowKink: 70n,
  borrowPerYearInterestRateSlopeLow: 15n,
  borrowPerYearInterestRateSlopeHigh: 25n,
  borrowPerYearInterestRateBase: 3n,
};

const mockBaseToken: IBase = {
  tokenAddress: "0xBase",
  symbol: "BASE",
  decimals: 18n,
  price: "1.0",
  priceFeedAddress: "0xFeed",
  baseMinForRewards: 2n,
  baseTrackingBorrowSpeed: 3n,
  baseTrackingSupplySpeed: 4n,
  baseIndexScale: 5n,
  curvePresets: [mockCurve],
};

const mockCollateralData: ICollateral = {
  tokenAddress: "0xCol",
  symbol: "COL",
  decimals: 18n,
  price: "2.0",
  priceFeedAddress: "0xFeed",
  totalSupplyAsset: 100n,
  collateralReserves: 10n,
  cometBalance: 50n,
  collateralFactor: 1n,
  liquidationFactor: 1n,
  liquidationPenalty: 1n,
  cometScale: 8n,
  supplyCap: 1000n,
};
const mockCollateral = new Collateral(mockCollateralData);

const mockCompToken: IToken = {
  tokenAddress: "0xComp",
  symbol: "COMP",
  decimals: 18n,
  price: "1.5",
  priceFeedAddress: "0xFeed",
};

const mockRewardToken: IToken = {
  tokenAddress: "0xReward",
  symbol: "RWD",
  decimals: 18n,
  price: "2.0",
  priceFeedAddress: "0xFeed",
};

const mockProposal = {
  name: "Proposal1",
  date: new Date(),
  txHash: "0xTxHash",
  collateralsParams: [],
};

const mockMarketData: IMarket = {
  chain: 1,
  cometAddress: "0xComet",
  utilization: 10n,
  supplyRate: 20n,
  borrowRate: 30n,
  borrowMinAmount: 40n,
  totalBorrow: 50n,
  totalSupply: 60n,
  totalReserves: 70n,
  baseToken: mockBaseToken,
  collaterals: [mockCollateral],
  availableLiquidity: 80n,
  configControllerAddress: "0xConfig",
  ownerAddress: "0xOwner",
  guardianAddress: "0xGuardian",
  curatorAddress: "0xCurator",
  curatorFee: 5,
  proposals: [mockProposal],
  compToken: mockCompToken,
  rewardTokens: [mockRewardToken],
};

const mockInterestRateModel: IMarketInterestRateModel = {
  borrowApr: "1.0",
  earnApr: "2.0",
  utilization: "50.0",
};

describe("Market", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(MarketMethods, "getInterestRateChartData").mockReturnValue([
      mockInterestRateModel,
    ]);
    vi.spyOn(MarketMethods, "getTotalSupplyUSD").mockReturnValue(123);
    vi.spyOn(MarketMethods, "totalBorrowUSD").mockReturnValue(456);
    vi.spyOn(MarketMethods, "getTotalReservesUSD").mockReturnValue(789);
    vi.spyOn(MarketMethods, "getUtilization").mockReturnValue(42);
    vi.spyOn(MarketMethods, "getCollateralization").mockReturnValue(99);
    vi.spyOn(MarketMethods, "getTVL").mockReturnValue(77);
    vi.spyOn(MarketMethods, "calcApr").mockReturnValue(88);
    vi.spyOn(MarketMethods, "totalEarned").mockReturnValue(1000n);
    vi.spyOn(MarketMethods, "totalBorrowed").mockReturnValue(2000n);
    vi.spyOn(MarketMethods, "netEarnAprs").mockReturnValue([1, 2, 3]);
    vi.spyOn(MarketMethods, "netBorrowAprs").mockReturnValue([4, 5, 6]);
    vi.spyOn(MarketMethods, "getTotalCollateralsSupply").mockReturnValue(555);
    vi.spyOn(MarketMethods, "getMarketsToMigrate").mockReturnValue([
      {} as Market,
    ]);
  });

  it("should assign all properties from constructor", () => {
    const market = new Market(mockMarketData);
    expect(market.chain).toBe(mockMarketData.chain);
    expect(market.cometAddress).toBe(mockMarketData.cometAddress);
    expect(market.utilization).toBe(mockMarketData.utilization);
    expect(market.supplyRate).toBe(mockMarketData.supplyRate);
    expect(market.borrowRate).toBe(mockMarketData.borrowRate);
    expect(market.borrowMinAmount).toBe(mockMarketData.borrowMinAmount);
    expect(market.totalBorrow).toBe(mockMarketData.totalBorrow);
    expect(market.totalSupply).toBe(mockMarketData.totalSupply);
    expect(market.totalReserves).toBe(mockMarketData.totalReserves);
    expect(market.baseToken).toBe(mockMarketData.baseToken);
    expect(market.collaterals).toBe(mockMarketData.collaterals);
    expect(market.availableLiquidity).toBe(mockMarketData.availableLiquidity);
    expect(market.configControllerAddress).toBe(
      mockMarketData.configControllerAddress,
    );
    expect(market.ownerAddress).toBe(mockMarketData.ownerAddress);
    expect(market.guardianAddress).toBe(mockMarketData.guardianAddress);
    expect(market.curatorAddress).toBe(mockMarketData.curatorAddress);
    expect(market.curatorFee).toBe(mockMarketData.curatorFee);
    expect(market.proposals).toBe(mockMarketData.proposals);
    expect(market.compToken).toBe(mockMarketData.compToken);
    expect(market.rewardTokens).toBe(mockMarketData.rewardTokens);
  });

  it("should return correct values from all getters", () => {
    const market = new Market(mockMarketData);
    expect(market.interestRateChartData).toEqual([mockInterestRateModel]);
    expect(market.totalSupplyUSD).toBe(123);
    expect(market.totalBorrowUSD).toBe(456);
    expect(market.totalReservesUSD).toBe(789);
    expect(market.utilizationPercent).toBe(42);
    expect(market.collateralization).toBe(99);
    expect(market.totalValueLocked).toBe(77);
    expect(market.borrowApr).toBe(88);
    expect(market.supplyApr).toBe(88);
    expect(market.price).toBe(mockBaseToken.price);
    expect(market.totalEarned).toBe(1000n);
    expect(market.totalBorrowed).toBe(2000n);
    expect(market.netEarnAprs).toEqual([1, 2, 3]);
    expect(market.netBorrowAprs).toEqual([4, 5, 6]);
    expect(market.totalCollateralsSupplyUSD).toBe(555);
  });

  it("should call getMarketsToMigrate in marketsToMigrate", () => {
    const market = new Market(mockMarketData);
    const result = market.marketsToMigrate([market]);
    expect(MarketMethods.getMarketsToMigrate).toHaveBeenCalledWith(
      [market],
      mockBaseToken,
      [mockCollateral],
    );
    expect(result).toEqual([{} as Market]);
  });

  it("should handle empty rewardTokens and proposals", () => {
    const data: IMarket = {
      ...mockMarketData,
      rewardTokens: [],
      proposals: [],
    };
    const market = new Market(data);
    expect(market.rewardTokens).toEqual([]);
    expect(market.proposals).toEqual([]);
  });

  it("should handle multiple collaterals", () => {
    const collaterals: Collateral[] = [
      mockCollateral,
      new Collateral({ ...mockCollateralData, tokenAddress: "0xCol2" }),
    ];
    const data: IMarket = { ...mockMarketData, collaterals };
    const market = new Market(data);
    expect(market.collaterals.length).toBe(2);
    expect(market.collaterals[1]!.tokenAddress).toBe("0xCol2");
  });

  it("should handle different baseToken and compToken", () => {
    const data: IMarket = {
      ...mockMarketData,
      compToken: { ...mockCompToken, tokenAddress: "0xOther" },
    };
    const market = new Market(data);
    expect(market.compToken.tokenAddress).toBe("0xOther");
  });

  it("should handle edge cases for getters", () => {
    vi.spyOn(MarketMethods, "getInterestRateChartData").mockReturnValue([]);
    vi.spyOn(MarketMethods, "getTotalSupplyUSD").mockReturnValue(0);
    vi.spyOn(MarketMethods, "totalBorrowUSD").mockReturnValue(0);
    vi.spyOn(MarketMethods, "getTotalReservesUSD").mockReturnValue(0);
    vi.spyOn(MarketMethods, "getUtilization").mockReturnValue(0);
    vi.spyOn(MarketMethods, "getCollateralization").mockReturnValue(0);
    vi.spyOn(MarketMethods, "getTVL").mockReturnValue(0);
    vi.spyOn(MarketMethods, "calcApr").mockReturnValue(0);
    vi.spyOn(MarketMethods, "totalEarned").mockReturnValue(0n);
    vi.spyOn(MarketMethods, "totalBorrowed").mockReturnValue(0n);
    vi.spyOn(MarketMethods, "netEarnAprs").mockReturnValue([]);
    vi.spyOn(MarketMethods, "netBorrowAprs").mockReturnValue([]);
    vi.spyOn(MarketMethods, "getTotalCollateralsSupply").mockReturnValue(0);
    const market = new Market(mockMarketData);
    expect(market.interestRateChartData).toEqual([]);
    expect(market.totalSupplyUSD).toBe(0);
    expect(market.totalBorrowUSD).toBe(0);
    expect(market.totalReservesUSD).toBe(0);
    expect(market.utilizationPercent).toBe(0);
    expect(market.collateralization).toBe(0);
    expect(market.totalValueLocked).toBe(0);
    expect(market.borrowApr).toBe(0);
    expect(market.supplyApr).toBe(0);
    expect(market.totalEarned).toBe(0n);
    expect(market.totalBorrowed).toBe(0n);
    expect(market.netEarnAprs).toEqual([]);
    expect(market.netBorrowAprs).toEqual([]);
    expect(market.totalCollateralsSupplyUSD).toBe(0);
  });
});
