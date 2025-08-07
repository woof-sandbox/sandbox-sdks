import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Market, MarketMethods } from '../../src';
import type { IMarket, Collateral, IBase, IToken, ICurve, IMarketProposalTx, IMarketInterestRateModel } from '../../src';

// Mock MarketMethods
vi.mock('./MarketMethods', () => ({
  MarketMethods: {
    getInterestRateChartData: vi.fn(),
    getTotalSupplyUSD: vi.fn(),
    totalBorrowUSD: vi.fn(),
    getTotalReservesUSD: vi.fn(),
    getUtilization: vi.fn(),
    getCollateralization: vi.fn(),
    getTVL: vi.fn(),
    calcApr: vi.fn(),
    totalEarned: vi.fn(),
    totalBorrowed: vi.fn(),
    netEarnAprs: vi.fn(),
    netBorrowAprs: vi.fn(),
    getTotalCollateralsSupply: vi.fn(),
    getMarketsToMigrate: vi.fn(),
  },
}));

describe('Market', () => {
  let mockMarketData: IMarket;
  let mockCurve: ICurve;
  let mockBaseToken: IBase;
  let mockCompToken: IToken;
  let mockRewardTokens: IToken[];
  let mockCollaterals: Collateral[];
  let mockProposals: IMarketProposalTx[];

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();

    // Mock curve data
    mockCurve = {
      id: 'curve-1',
      supplyKink: 900000000000000000n,
      supplyPerYearInterestRateSlopeLow: 1712328767n,
      supplyPerYearInterestRateSlopeHigh: 96207508878n,
      supplyPerYearInterestRateBase: 0n,
      borrowKink: 900000000000000000n,
      borrowPerYearInterestRateSlopeLow: 1585489599n,
      borrowPerYearInterestRateSlopeHigh: 107813292744n,
      borrowPerYearInterestRateBase: 475646879n,
    };

    // Mock base token
    mockBaseToken = {
      tokenAddress: '0x1234567890123456789012345678901234567890',
      symbol: 'USDT',
      decimals: 6n,
      price: '1.00',
      priceFeedAddress: '0x5678901234567890123456789012345678901234',
      baseMinBorrow: 1000000000000000n,
      baseMinForRewards: 100000000000n,
      baseTrackingBorrowSpeed: 578703703703n,
      baseTrackingSupplySpeed: 810185185185n,
      baseIndexScale: 1000000000000000n,
      curvePresets: [mockCurve],
    };

    // Mock comp token
    mockCompToken = {
      tokenAddress: '0xc00e94Cb662C3520282E6f5717214004A7f26888',
      symbol: 'COMP',
      decimals: 18n,
      price: '50.00',
      priceFeedAddress: '0x9012345678901234567890123456789012345678',
    };

    // Mock reward tokens
    mockRewardTokens = [
      {
        tokenAddress: '0x3456789012345678901234567890123456789012',
        symbol: 'REWARD1',
        decimals: 18n,
        price: '10.00',
        priceFeedAddress: '0x4567890123456789012345678901234567890123',
      },
    ];

    // Mock collaterals
    mockCollaterals = [
      {
        tokenAddress: '0x2345678901234567890123456789012345678901',
        symbol: 'WETH',
        decimals: 18n,
        price: '2000.00',
        priceFeedAddress: '0x6789012345678901234567890123456789012345',
        liquidateCollateralFactor: [750000000000000000n],
        liquidationFactor: 800000000000000000n,
        supplyCap: 1000000000000000000000n,
        balance: 500000000000000000000n,
      },
    ] as Collateral[];

    // Mock proposals
    mockProposals = [
      {
        id: 'proposal-1',
        status: 'pending',
        description: 'Test proposal',
        createdAt: Date.now(),
      },
    ] as IMarketProposalTx[];

    // Complete mock market data
    mockMarketData = {
      chain: 1,
      cometAddress: '0x3Afdc9BCA9213A35503b077a6072F3D0d5AB0840',
      utilization: 622155096290286592n,
      supplyRate: 1065334068n,
      borrowRate: 1462067313n,
      borrowMinAmount: 1000000000000000n,
      totalBorrow: 115139196488456n,
      totalSupply: 185064689883219n,
      totalReserves: 1368714199302n,
      baseToken: mockBaseToken,
      collaterals: mockCollaterals,
      availableLiquidity: 71294244719270n,
      configControllerAddress: '0x7890123456789012345678901234567890123456',
      ownerAddress: '0x8901234567890123456789012345678901234567',
      guardianAddress: '0x9012345678901234567890123456789012345678',
      curatorAddress: '0x0123456789012345678901234567890123456789',
      curatorFee: 5,
      proposals: mockProposals,
      compToken: mockCompToken,
      rewardTokens: mockRewardTokens,
    };
  });

  describe('constructor', () => {
    it('should initialize all properties correctly', () => {
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
      expect(market.configControllerAddress).toBe(mockMarketData.configControllerAddress);
      expect(market.ownerAddress).toBe(mockMarketData.ownerAddress);
      expect(market.guardianAddress).toBe(mockMarketData.guardianAddress);
      expect(market.curatorAddress).toBe(mockMarketData.curatorAddress);
      expect(market.curatorFee).toBe(mockMarketData.curatorFee);
      expect(market.proposals).toBe(mockMarketData.proposals);
      expect(market.compToken).toBe(mockMarketData.compToken);
      expect(market.rewardTokens).toBe(mockMarketData.rewardTokens);
    });
  });

  describe('interestRateChartData getter', () => {
    it('should call MarketMethods.getInterestRateChartData with correct parameters', () => {
      const mockChartData: IMarketInterestRateModel[] = [
        { utilization: '0.5', earnApr: '0.02', borrowApr: '0.03' },
      ];
      const mockUtilization = 0.62;

      (MarketMethods.getUtilization as any).mockReturnValue(mockUtilization);
      (MarketMethods.getInterestRateChartData as any).mockReturnValue(mockChartData);

      const market = new Market(mockMarketData);
      const result = market.interestRateChartData;

      expect(MarketMethods.getInterestRateChartData).toHaveBeenCalledWith(
          mockUtilization,
          mockBaseToken.curvePresets[0]
      );
      expect(result).toBe(mockChartData);
    });
  });

  describe('totalSupplyUSD getter', () => {
    it('should call MarketMethods.getTotalSupplyUSD with correct parameters', () => {
      const mockUSDValue = 185064.69;
      (MarketMethods.getTotalSupplyUSD as any).mockReturnValue(mockUSDValue);

      const market = new Market(mockMarketData);
      const result = market.totalSupplyUSD;

      expect(MarketMethods.getTotalSupplyUSD).toHaveBeenCalledWith(
          mockMarketData.totalSupply,
          mockMarketData.baseToken
      );
      expect(result).toBe(mockUSDValue);
    });
  });

  describe('totalBorrowUSD getter', () => {
    it('should call MarketMethods.totalBorrowUSD with correct parameters', () => {
      const mockUSDValue = 115139.19;
      (MarketMethods.totalBorrowUSD as any).mockReturnValue(mockUSDValue);

      const market = new Market(mockMarketData);
      const result = market.totalBorrowUSD;

      expect(MarketMethods.totalBorrowUSD).toHaveBeenCalledWith(
          mockMarketData.totalBorrow,
          mockMarketData.baseToken
      );
      expect(result).toBe(mockUSDValue);
    });
  });

  describe('totalReservesUSD getter', () => {
    it('should call MarketMethods.getTotalReservesUSD with correct parameters', () => {
      const mockUSDValue = 1368.71;
      (MarketMethods.getTotalReservesUSD as any).mockReturnValue(mockUSDValue);

      const market = new Market(mockMarketData);
      const result = market.totalReservesUSD;

      expect(MarketMethods.getTotalReservesUSD).toHaveBeenCalledWith(
          mockMarketData.totalReserves,
          mockMarketData.baseToken
      );
      expect(result).toBe(mockUSDValue);
    });
  });

  describe('utilizationPercent getter', () => {
    it('should call MarketMethods.getUtilization with correct parameters', () => {
      const mockUtilization = 0.622;
      (MarketMethods.getUtilization as any).mockReturnValue(mockUtilization);

      const market = new Market(mockMarketData);
      const result = market.utilizationPercent;

      expect(MarketMethods.getUtilization).toHaveBeenCalledWith(
          mockMarketData.utilization
      );
      expect(result).toBe(mockUtilization);
    });
  });

  describe('collateralization getter', () => {
    it('should call MarketMethods.getCollateralization with correct parameters', () => {
      const mockCollateralization = 1.6;
      (MarketMethods.getCollateralization as any).mockReturnValue(mockCollateralization);

      const market = new Market(mockMarketData);
      const result = market.collateralization;

      expect(MarketMethods.getCollateralization).toHaveBeenCalledWith(
          mockMarketData.totalBorrow,
          mockMarketData.totalSupply,
          mockMarketData.baseToken
      );
      expect(result).toBe(mockCollateralization);
    });
  });

  describe('totalValueLocked getter', () => {
    it('should call MarketMethods.getTVL with correct parameters', () => {
      const mockTVL = 1071294.24;
      (MarketMethods.getTVL as any).mockReturnValue(mockTVL);

      const market = new Market(mockMarketData);
      const result = market.totalValueLocked;

      expect(MarketMethods.getTVL).toHaveBeenCalledWith(
          mockMarketData.availableLiquidity,
          mockMarketData.baseToken,
          mockMarketData.collaterals
      );
      expect(result).toBe(mockTVL);
    });
  });

  describe('borrowApr getter', () => {
    it('should call MarketMethods.calcApr with borrowRate', () => {
      const mockApr = 0.04;
      (MarketMethods.calcApr as any).mockReturnValue(mockApr);

      const market = new Market(mockMarketData);
      const result = market.borrowApr;

      expect(MarketMethods.calcApr).toHaveBeenCalledWith(mockMarketData.borrowRate);
      expect(result).toBe(mockApr);
    });
  });

  describe('supplyApr getter', () => {
    it('should call MarketMethods.calcApr with supplyRate', () => {
      const mockApr = 0.025;
      (MarketMethods.calcApr as any).mockReturnValue(mockApr);

      const market = new Market(mockMarketData);
      const result = market.supplyApr;

      expect(MarketMethods.calcApr).toHaveBeenCalledWith(mockMarketData.supplyRate);
      expect(result).toBe(mockApr);
    });
  });

  describe('price getter', () => {
    it('should return baseToken price', () => {
      const market = new Market(mockMarketData);
      const result = market.price;

      expect(result).toBe(mockMarketData.baseToken.price);
    });
  });

  describe('totalEarned getter', () => {
    it('should call MarketMethods.totalEarned with correct parameters', () => {
      const mockTotalEarned = 185064689883219n;
      (MarketMethods.totalEarned as any).mockReturnValue(mockTotalEarned);

      const market = new Market(mockMarketData);
      const result = market.totalEarned;

      expect(MarketMethods.totalEarned).toHaveBeenCalledWith(
          mockMarketData.baseToken.price,
          mockMarketData.totalSupply
      );
      expect(result).toBe(mockTotalEarned);
    });
  });

  describe('totalBorrowed getter', () => {
    it('should call MarketMethods.totalBorrowed with correct parameters', () => {
      const mockTotalBorrowed = 115139196488456n;
      (MarketMethods.totalBorrowed as any).mockReturnValue(mockTotalBorrowed);

      const market = new Market(mockMarketData);
      const result = market.totalBorrowed;

      expect(MarketMethods.totalBorrowed).toHaveBeenCalledWith(
          mockMarketData.baseToken.price,
          mockMarketData.totalBorrow
      );
      expect(result).toBe(mockTotalBorrowed);
    });
  });

  describe('netEarnAprs getter', () => {
    it('should call MarketMethods.netEarnAprs with correct parameters', () => {
      const mockNetAprs = [0.025, 0.03];
      const mockSupplyApr = 0.025;
      const mockTotalEarned = 185064689883219n;

      (MarketMethods.calcApr as any).mockReturnValue(mockSupplyApr);
      (MarketMethods.totalEarned as any).mockReturnValue(mockTotalEarned);
      (MarketMethods.netEarnAprs as any).mockReturnValue(mockNetAprs);

      const market = new Market(mockMarketData);
      const result = market.netEarnAprs;

      expect(MarketMethods.netEarnAprs).toHaveBeenCalledWith(
          mockMarketData.baseToken,
          mockTotalEarned,
          mockMarketData.compToken,
          mockMarketData.rewardTokens,
          mockSupplyApr
      );
      expect(result).toBe(mockNetAprs);
    });
  });

  describe('netBorrowAprs getter', () => {
    it('should call MarketMethods.netBorrowAprs with correct parameters', () => {
      const mockNetAprs = [0.04, 0.035];
      const mockBorrowApr = 0.04;
      const mockTotalBorrowed = 115139196488456n;

      (MarketMethods.calcApr as any).mockReturnValue(mockBorrowApr);
      (MarketMethods.totalBorrowed as any).mockReturnValue(mockTotalBorrowed);
      (MarketMethods.netBorrowAprs as any).mockReturnValue(mockNetAprs);

      const market = new Market(mockMarketData);
      const result = market.netBorrowAprs;

      expect(MarketMethods.netBorrowAprs).toHaveBeenCalledWith(
          mockMarketData.baseToken,
          mockTotalBorrowed,
          mockMarketData.compToken,
          mockMarketData.rewardTokens,
          mockBorrowApr
      );
      expect(result).toBe(mockNetAprs);
    });
  });

  describe('totalCollateralsSupplyUSD getter', () => {
    it('should call MarketMethods.getTotalCollateralsSupply with correct parameters', () => {
      const mockCollateralSupply = 1000000.0;
      (MarketMethods.getTotalCollateralsSupply as any).mockReturnValue(mockCollateralSupply);

      const market = new Market(mockMarketData);
      const result = market.totalCollateralsSupplyUSD;

      expect(MarketMethods.getTotalCollateralsSupply).toHaveBeenCalledWith(
          mockMarketData.collaterals
      );
      expect(result).toBe(mockCollateralSupply);
    });
  });

  describe('marketsToMigrate method', () => {
    it('should call MarketMethods.getMarketsToMigrate with correct parameters', () => {
      const mockMarketsList = [new Market(mockMarketData)];
      const mockMigrateMarkets = [new Market(mockMarketData)];
      (MarketMethods.getMarketsToMigrate as any).mockReturnValue(mockMigrateMarkets);

      const market = new Market(mockMarketData);
      const result = market.marketsToMigrate(mockMarketsList);

      expect(MarketMethods.getMarketsToMigrate).toHaveBeenCalledWith(
          mockMarketsList,
          mockMarketData.baseToken,
          mockMarketData.collaterals
      );
      expect(result).toBe(mockMigrateMarkets);
    });

    it('should handle empty markets list', () => {
      const mockMigrateMarkets: Market[] = [];
      (MarketMethods.getMarketsToMigrate as any).mockReturnValue(mockMigrateMarkets);

      const market = new Market(mockMarketData);
      const result = market.marketsToMigrate([]);

      expect(MarketMethods.getMarketsToMigrate).toHaveBeenCalledWith(
          [],
          mockMarketData.baseToken,
          mockMarketData.collaterals
      );
      expect(result).toEqual([]);
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle missing curvePresets gracefully', () => {
      const marketDataWithoutCurves = {
        ...mockMarketData,
        baseToken: {
          ...mockBaseToken,
          curvePresets: [],
        },
      };

      const market = new Market(marketDataWithoutCurves);

      expect(() => market.interestRateChartData).not.toThrow();
      expect(MarketMethods.getInterestRateChartData).toHaveBeenCalledWith(
          expect.any(Number),
          undefined
      );
    });

    it('should handle zero values correctly', () => {
      const marketDataWithZeros = {
        ...mockMarketData,
        totalBorrow: 0n,
        totalSupply: 0n,
        totalReserves: 0n,
        availableLiquidity: 0n,
        utilization: 0n,
      };

      const market = new Market(marketDataWithZeros);

      expect(market.totalBorrow).toBe(0n);
      expect(market.totalSupply).toBe(0n);
      expect(market.totalReserves).toBe(0n);
      expect(market.availableLiquidity).toBe(0n);
      expect(market.utilization).toBe(0n);
    });

    it('should handle empty arrays correctly', () => {
      const marketDataWithEmptyArrays = {
        ...mockMarketData,
        collaterals: [],
        rewardTokens: [],
        proposals: [],
      };

      const market = new Market(marketDataWithEmptyArrays);

      expect(market.collaterals).toEqual([]);
      expect(market.rewardTokens).toEqual([]);
      expect(market.proposals).toEqual([]);
    });
  });

  describe('property immutability', () => {
    it('should not modify original market data when creating new instance', () => {
      const originalData = { ...mockMarketData };
      const market = new Market(mockMarketData);

      // Modify market properties
      market.chain = 999;
      market.curatorFee = 10;

      // Original data should remain unchanged
      expect(mockMarketData.chain).toBe(originalData.chain);
      expect(mockMarketData.curatorFee).toBe(originalData.curatorFee);
    });
  });
});