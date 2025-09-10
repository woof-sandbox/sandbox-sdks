import { describe, expect, it } from "vitest";
import {
  Collateral,
  type IBase,
  type ICollateral,
  type IToken,
  Market,
  MarketMethods,
} from "../../src";

const SECONDS_PER_YEAR = 31536000;

const mockRate = 1000000000000000000n; // 1e18
const mockBaseTrackingSpeed = 100000000000000n;
const mockBaseTotalSupply = 1000000000000000000000n; // 1e21
const mockBaseTotalBorrow = 500000000000000000000n; // 5e20

const mockCompToken: IToken = {
  tokenAddress: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
  symbol: "USDT",
  priceFeedDecimals: BigInt(6n),
  price: "1.0",
  priceFeedAddress: "0x3E7d1eAB13ad0104d2750B8863b489D65364e32D",
};
const mockRewardToken: IToken = {
  tokenAddress: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
  symbol: "USDT",
  priceFeedDecimals: BigInt(6n),
  price: "1.0",
  priceFeedAddress: "0x3E7d1eAB13ad0104d2750B8863b489D65364e32D",
};
const mockBaseToken: IBase = {
  baseMinForRewards: BigInt(100000000000), // 1e9
  baseTrackingBorrowSpeed: BigInt(578703703703),
  baseTrackingSupplySpeed: BigInt(810185185185),
  baseIndexScale: BigInt(1e15),
  curvePresets: [],
  ...mockCompToken,
};

describe("MarketMethods", () => {
  it("should correctly calculate APR from rate", () => {
    const result = MarketMethods.calcApr(mockRate);
    const expected = Number(mockRate * BigInt(SECONDS_PER_YEAR)) / 1e16; // Adjust precision
    expect(result).toBeCloseTo(expected, 5);
  });

  it("should handle zero rate", () => {
    expect(MarketMethods.calcApr(BigInt(0))).toBe(0);
  });

  it("should handle undefined rate", () => {
    expect(MarketMethods.calcApr(undefined)).toBe(0);
  });

  it("should calculate APR using getApr", () => {
    const utilization = 50n * BigInt(1e16); // 50%
    const kink = 80n * BigInt(1e16); // 80%
    const perSecondInterestRateBase = 2n * BigInt(1e18);
    const perSecondInterestRateSlopeLow = BigInt(0.05 * 1e18);
    const perSecondInterestRateSlopeHigh = BigInt(0.5 * 1e18);
    const result = MarketMethods.getApr(
      utilization,
      kink,
      perSecondInterestRateBase,
      perSecondInterestRateSlopeLow,
      perSecondInterestRateSlopeHigh,
    );
    expect(result).toBeCloseTo(202.5, 2);
  });

  it("should calculate APR using getApr above kink", () => {
    const utilization = 90n * BigInt(1e16); // 90%
    const kink = 80n * BigInt(1e16); // 80%
    const perSecondInterestRateBase = 2n * BigInt(1e18);
    const perSecondInterestRateSlopeLow = BigInt(0.05 * 1e18);
    const perSecondInterestRateSlopeHigh = BigInt(0.5 * 1e18);
    const result = MarketMethods.getApr(
      utilization,
      kink,
      perSecondInterestRateBase,
      perSecondInterestRateSlopeLow,
      perSecondInterestRateSlopeHigh,
    );
    expect(result).toBeCloseTo(209, 2);
  });

  it("should calculate net APRs correctly for supply", () => {
    const supplyApr = 5.0;
    const result = MarketMethods.calcNetAprs(
      mockBaseToken,
      mockBaseTrackingSpeed,
      mockBaseTotalSupply,
      mockCompToken,
      [mockRewardToken],
      supplyApr,
    );

    expect(result.length).toBe(3);
    expect(result[0]).toBe(supplyApr);
    expect(result[1]).toBeGreaterThanOrEqual(0);
    expect(result[2]).toBeGreaterThanOrEqual(0);
  });

  it("should handle zero total supply", () => {
    const result = MarketMethods.calcNetAprs(
      mockBaseToken,
      mockBaseTrackingSpeed,
      BigInt(0),
      mockCompToken,
      [mockRewardToken],
      5.0,
    );

    expect(result[0]).toBe(5.0);
    expect(result[1]).toBe(0);
    expect(result[2]).toBe(0);
  });

  it("should delegate to calcNetAprs with supply parameters", () => {
    const supplyApr = 3.0;
    const result = MarketMethods.netEarnAprs(
      mockBaseToken,
      mockBaseTotalSupply,
      mockCompToken,
      [mockRewardToken],
      supplyApr,
    );

    expect(result.length).toBe(3);
    expect(result[0]).toBe(supplyApr);
    expect(result[1]).toBeGreaterThanOrEqual(0);
    expect(result[2]).toBeGreaterThanOrEqual(0);
  });

  it("should delegate to calcNetAprs with borrow parameters", () => {
    const borrowApr = 4.0;
    const result = MarketMethods.netBorrowAprs(
      mockBaseToken,
      mockBaseTotalBorrow,
      mockCompToken,
      [mockRewardToken],
      borrowApr,
    );

    expect(result.length).toBe(3);
    expect(result[0]).toBe(borrowApr);
    expect(result[1]).toBeGreaterThanOrEqual(0);
    expect(result[2]).toBeGreaterThanOrEqual(0);
  });

  it("calculates correctly with basic values for totalEarned", () => {
    const price = "2";
    const supply = 1000n;

    const result = MarketMethods.totalEarned(price, supply);
    expect(result).toBe(2000n);
  });

  it("handles decimal price correctly for totalEarned", () => {
    const price = "0.5";
    const supply = 4000n;

    const result = MarketMethods.totalEarned(price, supply);
    expect(result).toBe(2000n);
  });

  it("returns 0 for zero supply in totalEarned", () => {
    const result = MarketMethods.totalEarned("1.23", 0n);
    expect(result).toBe(0n);
  });

  it("returns 0 for zero price in totalEarned", () => {
    const result = MarketMethods.totalEarned("0", 1000n);
    expect(result).toBe(0n);
  });

  it("calculates correctly with basic values for totalBorrowed", () => {
    const price = "3";
    const borrowed = 100n;

    const result = MarketMethods.totalBorrowed(price, borrowed);
    expect(result).toBe(300n);
  });

  it("handles decimal price correctly for totalBorrowed", () => {
    const price = "0.25";
    const borrowed = 8000n;

    const result = MarketMethods.totalBorrowed(price, borrowed);
    expect(result).toBe(2000n);
  });

  it("returns 0 for zero borrowed in totalBorrowed", () => {
    const result = MarketMethods.totalBorrowed("4.56", 0n);
    expect(result).toBe(0n);
  });

  it("returns 0 for zero price in totalBorrowed", () => {
    const result = MarketMethods.totalBorrowed("0", 123n);
    expect(result).toBe(0n);
  });

  it("should calculate TVL correctly", () => {
    const cometBalance = 1000n;
    const baseToken = { ...mockBaseToken, price: "2.0", decimals: BigInt(6) };
    const collaterals: ICollateral[] = [
      {
        tokenAddress: "0x1",
        symbol: "COL1",
        priceFeedDecimals: BigInt(6),
        price: "1.5",
        priceFeedAddress: "0xfeed1",
        totalSupplyAsset: 100n,
        collateralReserves: 10n,
        cometBalance: 500n,
        collateralFactor: 500000000000000000n,
        liquidationFactor: 700000000000000000n,
        liquidationPenalty: 250000000000000000n,
        cometScale: 8n,
        supplyCap: 100000000000000000000000n,
      },
      {
        tokenAddress: "0x2",
        symbol: "COL2",
        priceFeedDecimals: BigInt(6),
        price: "3.0",
        priceFeedAddress: "0xfeed2",
        totalSupplyAsset: 200n,
        collateralReserves: 20n,
        cometBalance: 200n,
        collateralFactor: 500000000000000000n,
        liquidationFactor: 700000000000000000n,
        liquidationPenalty: 250000000000000000n,
        cometScale: 8n,
        supplyCap: 100000000000000000000000n,
      },
    ];
    const tvl = MarketMethods.getTVL(cometBalance, baseToken, collaterals);
    expect(typeof tvl).toBe("number");
    expect(tvl).toBeCloseTo(0.00335, 5);
  });

  it("should calculate collateralization ratio", () => {
    const totalBorrowed = 1000n;
    const totalSupplied = 2000n;
    const baseToken = { ...mockBaseToken, price: "2.0", decimals: BigInt(6) };
    const ratio = MarketMethods.getCollateralization(
      totalBorrowed,
      totalSupplied,
      baseToken,
    );
    expect(typeof ratio).toBe("number");
    expect(ratio).toBeGreaterThan(0);
  });

  it("should calculate utilization as a percentage", () => {
    const utilization = 500000000000000000n; // 0.5 in 1e18
    const percent = MarketMethods.getUtilization(utilization);
    expect(typeof percent).toBe("number");
    expect(percent).toBeCloseTo(50, 0);
  });

  it("should calculate total reserves in USD", () => {
    const totalReserves = 1000n;
    const baseToken = { ...mockBaseToken, price: "1.5", decimals: BigInt(6) };
    const usd = MarketMethods.getTotalReservesUSD(totalReserves, baseToken);
    expect(typeof usd).toBe("number");
    expect(usd).toBeGreaterThanOrEqual(0);
  });

  it("should calculate total borrow in USD", () => {
    const totalBorrow = 1000n;
    const baseToken = { ...mockBaseToken, price: "2.0", decimals: BigInt(6) };
    const usd = MarketMethods.totalBorrowUSD(totalBorrow, baseToken);
    expect(typeof usd).toBe("number");
    expect(usd).toBeCloseTo(0.002, 5); // 1000 / 1e6 * 2.0
  });

  it("should handle zero borrow in totalBorrowUSD", () => {
    const totalBorrow = 0n;
    const baseToken = { ...mockBaseToken, price: "2.0", decimals: BigInt(6) };
    const usd = MarketMethods.totalBorrowUSD(totalBorrow, baseToken);
    expect(usd).toBe(0);
  });

  it("should calculate total supply in USD", () => {
    const totalSupply = 2000n;
    const baseToken = { ...mockBaseToken, price: "1.5", decimals: BigInt(6) };
    const usd = MarketMethods.getTotalSupplyUSD(totalSupply, baseToken);
    expect(typeof usd).toBe("number");
    expect(usd).toBeCloseTo(0.003, 5); // 2000 / 1e6 * 1.5
  });

  it("should handle zero supply in getTotalSupplyUSD", () => {
    const totalSupply = 0n;
    const baseToken = { ...mockBaseToken, price: "1.5", decimals: BigInt(6) };
    const usd = MarketMethods.getTotalSupplyUSD(totalSupply, baseToken);
    expect(usd).toBe(0);
  });

  it("should calculate total collaterals supply", () => {
    const collaterals: ICollateral[] = [
      {
        tokenAddress: "0x1",
        symbol: "COL1",
        priceFeedDecimals: BigInt(6),
        price: "1.5",
        priceFeedAddress: "0xfeed1",
        totalSupplyAsset: 1000n,
        collateralReserves: 10n,
        cometBalance: 500n,
        collateralFactor: 500000000000000000n,
        liquidationFactor: 700000000000000000n,
        liquidationPenalty: 250000000000000000n,
        cometScale: 8n,
        supplyCap: 100000000000000000000000n,
      },
      {
        tokenAddress: "0x2",
        symbol: "COL2",
        priceFeedDecimals: BigInt(8),
        price: "3.0",
        priceFeedAddress: "0xfeed2",
        totalSupplyAsset: 2000n,
        collateralReserves: 20n,
        cometBalance: 200n,
        collateralFactor: 500000000000000000n,
        liquidationFactor: 700000000000000000n,
        liquidationPenalty: 250000000000000000n,
        cometScale: 8n,
        supplyCap: 100000000000000000000000n,
      },
    ];
    const total = MarketMethods.getTotalCollateralsSupply(collaterals);
    expect(typeof total).toBe("number");
    expect(total).toBeCloseTo(0.00102, 5); // 1000 / 1e6 + 2000 / 1e8
  });

  it("should handle empty collaterals in getTotalCollateralsSupply", () => {
    const total = MarketMethods.getTotalCollateralsSupply([]);
    expect(total).toBe(0);
  });

  it("should find markets to migrate with matching base token and collaterals", () => {
    const markets: Market[] = [
      new Market({
        chain: 1,
        cometAddress: "0xComet1",
        utilization: 0n,
        supplyRate: 0n,
        borrowRate: 0n,
        borrowMinAmount: 0n,
        totalBorrow: 0n,
        totalSupply: 0n,
        totalReserves: 0n,
        baseToken: mockBaseToken,
        collaterals: [
          new Collateral({
            tokenAddress: "0x1",
            symbol: "COL1",
            priceFeedDecimals: BigInt(6),
            price: "1.5",
            priceFeedAddress: "0xfeed1",
            totalSupplyAsset: 1000n,
            collateralReserves: 10n,
            cometBalance: 500n,
            collateralFactor: 500000000000000000n,
            liquidationFactor: 700000000000000000n,
            liquidationPenalty: 250000000000000000n,
            cometScale: 8n,
            supplyCap: 100000000000000000000000n,
          }),
        ],
        availableLiquidity: 0n,
        configControllerAddress: "0xConfig1",
        ownerAddress: "0xOwner1",
        guardianAddress: "0xGuardian1",
        curatorAddress: "0xCurator1",
        curatorFee: 0,
        proposals: [],
        compToken: mockCompToken,
        rewardTokens: [mockRewardToken],
      }),
      new Market({
        chain: 1,
        cometAddress: "0xComet2",
        utilization: 0n,
        supplyRate: 0n,
        borrowRate: 0n,
        borrowMinAmount: 0n,
        totalBorrow: 0n,
        totalSupply: 0n,
        totalReserves: 0n,
        baseToken: { ...mockBaseToken, tokenAddress: "0xDifferent" },
        collaterals: [
          new Collateral({
            tokenAddress: "0x1",
            symbol: "COL1",
            priceFeedDecimals: BigInt(6),
            price: "1.5",
            priceFeedAddress: "0xfeed1",
            totalSupplyAsset: 1000n,
            collateralReserves: 10n,
            cometBalance: 500n,
            collateralFactor: 500000000000000000n,
            liquidationFactor: 700000000000000000n,
            liquidationPenalty: 250000000000000000n,
            cometScale: 8n,
            supplyCap: 100000000000000000000000n,
          }),
        ],
        availableLiquidity: 0n,
        configControllerAddress: "0xConfig2",
        ownerAddress: "0xOwner2",
        guardianAddress: "0xGuardian2",
        curatorAddress: "0xCurator2",
        curatorFee: 0,
        proposals: [],
        compToken: mockCompToken,
        rewardTokens: [mockRewardToken],
      }),
      new Market({
        chain: 1,
        cometAddress: "0xComet3",
        utilization: 0n,
        supplyRate: 0n,
        borrowRate: 0n,
        borrowMinAmount: 0n,
        totalBorrow: 0n,
        totalSupply: 0n,
        totalReserves: 0n,
        baseToken: mockBaseToken,
        collaterals: [
          new Collateral({
            tokenAddress: "0x2",
            symbol: "COL2",
            priceFeedDecimals: BigInt(6),
            price: "3.0",
            priceFeedAddress: "0xfeed2",
            totalSupplyAsset: 2000n,
            collateralReserves: 20n,
            cometBalance: 200n,
            collateralFactor: 500000000000000000n,
            liquidationFactor: 700000000000000000n,
            liquidationPenalty: 250000000000000000n,
            cometScale: 8n,
            supplyCap: 100000000000000000000000n,
          }),
        ],
        availableLiquidity: 0n,
        configControllerAddress: "0xConfig3",
        ownerAddress: "0xOwner3",
        guardianAddress: "0xGuardian3",
        curatorAddress: "0xCurator3",
        curatorFee: 0,
        proposals: [],
        compToken: mockCompToken,
        rewardTokens: [mockRewardToken],
      }),
    ];
    const collaterals = [
      new Collateral({
        tokenAddress: "0x1",
        symbol: "COL1",
        priceFeedDecimals: BigInt(6),
        price: "1.5",
        priceFeedAddress: "0xfeed1",
        totalSupplyAsset: 1000n,
        collateralReserves: 10n,
        cometBalance: 500n,
        collateralFactor: 500000000000000000n,
        liquidationFactor: 700000000000000000n,
        liquidationPenalty: 250000000000000000n,
        cometScale: 8n,
        supplyCap: 100000000000000000000000n,
      }),
    ];
    const result = MarketMethods.getMarketsToMigrate(
      markets,
      mockBaseToken,
      collaterals,
    );
    expect(result.length).toBe(1);
    expect(result[0]!.baseToken.tokenAddress).toBe(mockBaseToken.tokenAddress);
    expect(result[0]!.collaterals[0]!.tokenAddress).toBe(
      collaterals[0]!.tokenAddress,
    );
  });

  it("should return empty array for no matching markets in getMarketsToMigrate", () => {
    const markets: Market[] = [
      new Market({
        chain: 1,
        cometAddress: "0xComet2",
        utilization: 0n,
        supplyRate: 0n,
        borrowRate: 0n,
        borrowMinAmount: 0n,
        totalBorrow: 0n,
        totalSupply: 0n,
        totalReserves: 0n,
        baseToken: { ...mockBaseToken, tokenAddress: "0xDifferent" },
        collaterals: [
          new Collateral({
            tokenAddress: "0x2",
            symbol: "COL2",
            priceFeedDecimals: BigInt(6),
            price: "3.0",
            priceFeedAddress: "0xfeed2",
            totalSupplyAsset: 2000n,
            collateralReserves: 20n,
            cometBalance: 200n,
            collateralFactor: 500000000000000000n,
            liquidationFactor: 700000000000000000n,
            liquidationPenalty: 250000000000000000n,
            cometScale: 8n,
            supplyCap: 100000000000000000000000n,
          }),
        ],
        availableLiquidity: 0n,
        configControllerAddress: "0xConfig2",
        ownerAddress: "0xOwner2",
        guardianAddress: "0xGuardian2",
        curatorAddress: "0xCurator2",
        curatorFee: 0,
        proposals: [],
        compToken: mockCompToken,
        rewardTokens: [mockRewardToken],
      }),
    ];
    const collaterals: ICollateral[] = [
      {
        tokenAddress: "0x1",
        symbol: "COL1",
        priceFeedDecimals: BigInt(6),
        price: "1.5",
        priceFeedAddress: "0xfeed1",
        totalSupplyAsset: 1000n,
        collateralReserves: 10n,
        cometBalance: 500n,
        collateralFactor: 500000000000000000n,
        liquidationFactor: 700000000000000000n,
        liquidationPenalty: 250000000000000000n,
        cometScale: 8n,
        supplyCap: 100000000000000000000000n,
      },
    ];
    const result = MarketMethods.getMarketsToMigrate(
      markets,
      mockBaseToken,
      collaterals,
    );
    expect(result).toEqual([]);
  });

  describe("getInterestRateChartData", () => {
    const mockCurvePresets = {
      id: "curve1",
      supplyKink: 80n,
      supplyPerYearInterestRateBase: 2n * BigInt(1e18),
      supplyPerYearInterestRateSlopeLow: BigInt(0.05 * 1e18),
      supplyPerYearInterestRateSlopeHigh: BigInt(0.5 * 1e18),
      borrowKink: 80n,
      borrowPerYearInterestRateBase: BigInt(3 * 1e18),
      borrowPerYearInterestRateSlopeLow: BigInt(0.1 * 1e18),
      borrowPerYearInterestRateSlopeHigh: BigInt(1e18),
    };

    it("should generate interest rate chart data", () => {
      const data = MarketMethods.getInterestRateChartData(50, mockCurvePresets);
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBe(101);
      expect(data[50]).toHaveProperty("utilization");
      expect(data[50]).toHaveProperty("borrowApr");
      expect(data[50]).toHaveProperty("earnApr");
    });

    it("should calculate APR correctly at 0% utilization", () => {
      const data = MarketMethods.getInterestRateChartData(50, mockCurvePresets);
      const point = data[0];

      expect(point!.utilization).toBe("0.00");
      expect(Number(point!.earnApr)).toBeCloseTo(200.0, 2);
      expect(Number(point!.borrowApr)).toBeCloseTo(300.0, 2);
    });

    it("should calculate APR correctly at kink (80%) utilization", () => {
      const data = MarketMethods.getInterestRateChartData(80, mockCurvePresets);
      const point = data[80];

      expect(point!.utilization).toBe("80.00");
      expect(Number(point!.earnApr)).toBeCloseTo(240.0, 2);
      expect(Number(point!.borrowApr)).toBeCloseTo(380.0, 2);
    });

    it("should calculate APR correctly at 100% utilization", () => {
      const data = MarketMethods.getInterestRateChartData(50, mockCurvePresets);
      const point = data[100];

      expect(point!.utilization).toBe("100.00");
      expect(Number(point!.earnApr)).toBeCloseTo(250.0, 2);
      expect(Number(point!.borrowApr)).toBeCloseTo(400.0, 2);
    });

    it("should handle zero interest rate parameters", () => {
      const zeroCurvePresets = {
        ...mockCurvePresets,
        supplyPerYearInterestRateBase: 0n,
        supplyPerYearInterestRateSlopeLow: 0n,
        supplyPerYearInterestRateSlopeHigh: 0n,
        borrowPerYearInterestRateBase: 0n,
        borrowPerYearInterestRateSlopeLow: 0n,
        borrowPerYearInterestRateSlopeHigh: 0n,
      };
      const data = MarketMethods.getInterestRateChartData(50, zeroCurvePresets);

      expect(data[0]!.earnApr).toBe("0.00");
      expect(data[0]!.borrowApr).toBe("0.00");
      expect(data[50]!.earnApr).toBe("0.00");
      expect(data[50]!.borrowApr).toBe("0.00");
      expect(data[100]!.earnApr).toBe("0.00");
      expect(data[100]!.borrowApr).toBe("0.00");
    });

    it("should handle extreme slope values", () => {
      const extremeCurvePresets = {
        ...mockCurvePresets,
        supplyPerYearInterestRateSlopeHigh: 10n * BigInt(1e18),
        borrowPerYearInterestRateSlopeHigh: 20n * BigInt(1e18),
      };
      const data = MarketMethods.getInterestRateChartData(
        50,
        extremeCurvePresets,
      );
      const point = data[100];

      expect(point!.utilization).toBe("100.00");
      expect(Number(point!.earnApr)).toBeCloseTo(1200.0, 2);
      expect(Number(point!.borrowApr)).toBeCloseTo(2300.0, 2);
    });

    it("should maintain precision across utilization range", () => {
      const data = MarketMethods.getInterestRateChartData(50, mockCurvePresets);

      const point50 = data[50];
      expect(Number(point50!.earnApr)).toBeCloseTo(225, 2);
      expect(Number(point50!.borrowApr)).toBeCloseTo(350, 2);

      const point90 = data[90];
      expect(Number(point90!.earnApr)).toBeCloseTo(245, 2);
      expect(Number(point90!.borrowApr)).toBeCloseTo(390, 2);
    });

    it("should respect provided utilization for exact match", () => {
      const utilization = 75;
      const data = MarketMethods.getInterestRateChartData(
        utilization,
        mockCurvePresets,
      );
      const point = data[utilization];

      expect(point!.utilization).toBe("75.00");
      expect(Number(point!.earnApr)).toBeCloseTo(237.5, 2);
      expect(Number(point!.borrowApr)).toBeCloseTo(375, 2);
    });
  });
});
