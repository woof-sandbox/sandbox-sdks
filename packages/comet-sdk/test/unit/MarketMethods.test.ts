import { describe, it, expect } from 'vitest';
import { MarketMethods } from '../../src';

const SECONDS_PER_YEAR = 31536000;

const mockRate = 1000000000000000000n; // 1e18
const mockBaseTrackingSpeed = 100000000000000n;
const mockBaseIndexScale = 1000000000000000000n; // 1e18
const mockTokenPrice = 50;
const mockBaseTotalSupply = 1000000000000000000000n; // 1e21
const mockBaseTotalBorrow = 500000000000000000000n; // 5e20
const mockCompDecimals = 18;
const mockBaseDecimals = 18;
const mockCompToSuppliersPerDay = 10n;
const mockCompToBorrowersPerDay = 15n;


describe('MarketMethods', () => {
  it('should correctly calculate getAprCoef', () => {
    const result = MarketMethods.getAprCoef(mockRate);
    expect(result).toBe(Number(mockRate * BigInt(SECONDS_PER_YEAR)) / 1e18);
  });

  it('should correctly calculate calcApr', () => {
    const result = MarketMethods.calcApr(mockRate);
    expect(result).toBe(MarketMethods.getAprCoef(mockRate) * 100);
  });

  it('should correctly calculate compToSuppliersPerDay', () => {
    const result = MarketMethods.compToSuppliersPerDay(mockBaseTrackingSpeed, mockBaseIndexScale);
    expect(result).toBe(mockBaseTrackingSpeed / mockBaseIndexScale * BigInt(86400));
  });

  it('should correctly calculate supplyCompRewardApr', () => {
    const result = MarketMethods.supplyCompRewardApr(
        mockTokenPrice,
        mockCompDecimals,
        mockCompToSuppliersPerDay,
        mockBaseTotalSupply,
        mockTokenPrice,
        mockBaseDecimals
    );
    expect(result).toBeGreaterThanOrEqual(0);
  });

  it('should correctly calculate netEarnApr', () => {
    const result = MarketMethods.netEarnApr(5, 3);
    expect(result).toBe(8);
  });

  it('should correctly calculate compToBorrowersPerDay', () => {
    const result = MarketMethods.compToBorrowersPerDay(mockBaseTrackingSpeed, mockBaseIndexScale);
    expect(result).toBe(mockBaseTrackingSpeed / mockBaseIndexScale * BigInt(86400));
  });

  it('should correctly calculate borrowCompRewardApr', () => {
    const result = MarketMethods.borrowCompRewardApr(
        mockTokenPrice,
        mockCompDecimals,
        mockCompToBorrowersPerDay,
        mockBaseTotalBorrow,
        mockTokenPrice,
        mockBaseDecimals
    );
    expect(result).toBeGreaterThanOrEqual(0);
  });

  it('should correctly calculate netBorrowApr', () => {
    const result = MarketMethods.netBorrowApr(7, 2);
    expect(result).toBe(9);
  });
});
