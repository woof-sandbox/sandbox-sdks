import { describe, expect, it } from "vitest";
import { MarketMethods } from "../../src";

const SECONDS_PER_YEAR = 31536000;

const mockRate = 1000000000000000000n; // 1e18
const mockBaseTrackingSpeed = 100000000000000n;
const mockBaseTotalSupply = 1000000000000000000000n; // 1e21
const mockBaseTotalBorrow = 500000000000000000000n; // 5e20

const mockCompToken = {
  tokenAddress: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
  symbol: "USDT",
  decimals: BigInt(6n),
  price: "1.0",
  priceFeedAddress: "0x3E7d1eAB13ad0104d2750B8863b489D65364e32D",
};
const mockRewardToken = {
  tokenAddress: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
  symbol: "USDT",
  decimals: BigInt(6n),
  price: "1.0",
  priceFeedAddress: "0x3E7d1eAB13ad0104d2750B8863b489D65364e32D",
};
const mockBaseToken = {
  baseMinBorrow: BigInt(100000000000),
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

  it("calculates correctly with basic values", () => {
    const price = "2";
    const supply = 1000n;

    const result = MarketMethods.totalEarned(price, supply);
    expect(result).toBe(2000n);
  });

  it("handles decimal price correctly", () => {
    const price = "0.5";
    const supply = 4000n;

    const result = MarketMethods.totalEarned(price, supply);
    expect(result).toBe(2000n);
  });

  it("returns 0 for zero supply", () => {
    const result = MarketMethods.totalEarned("1.23", 0n);
    expect(result).toBe(0n);
  });

  it("returns 0 for zero price", () => {
    const result = MarketMethods.totalEarned("0", 1000n);
    expect(result).toBe(0n);
  });

  it("calculates correctly with basic values", () => {
    const price = "3";
    const borrowed = 100n;

    const result = MarketMethods.totalBorrowed(price, borrowed);
    expect(result).toBe(300n);
  });

  it("handles decimal price correctly", () => {
    const price = "0.25";
    const borrowed = 8000n;

    const result = MarketMethods.totalBorrowed(price, borrowed);
    expect(result).toBe(2000n);
  });

  it("returns 0 for zero borrowed", () => {
    const result = MarketMethods.totalBorrowed("4.56", 0n);
    expect(result).toBe(0n);
  });

  it("returns 0 for zero price", () => {
    const result = MarketMethods.totalBorrowed("0", 123n);
    expect(result).toBe(0n);
  });

  it("should calculate TVL correctly", () => {
    const cometBalance = 1000n;
    const baseToken = { ...mockBaseToken, price: "2.0", decimals: BigInt(6) };
    const collaterals = [
      {
        tokenAddress: "0x1",
        symbol: "COL1",
        decimals: BigInt(6),
        price: "1.5",
        priceFeedAddress: "0xfeed1",
        totalSupplyAsset: 100n,
        collateralReserves: 10n,
        cometBalance: 500n,
        collateralFactor: 500000000000000000n,
        liquidationFactor: 700000000000000000n,
        liquidationPenalty: 250000000000000000n,
        supplyCap: 100000000000000000000000n,
      },
      {
        tokenAddress: "0x2",
        symbol: "COL2",
        decimals: BigInt(6),
        price: "3.0",
        priceFeedAddress: "0xfeed2",
        totalSupplyAsset: 200n,
        collateralReserves: 20n,
        cometBalance: 200n,
        collateralFactor: 500000000000000000n,
        liquidationFactor: 700000000000000000n,
        liquidationPenalty: 250000000000000000n,
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
