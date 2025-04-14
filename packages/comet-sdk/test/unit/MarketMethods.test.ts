import { describe, it, expect } from 'vitest';
import { MarketMethods } from '../../src';

const SECONDS_PER_YEAR = 31536000;

const mockRate = 1000000000000000000n; // 1e18
const mockBaseTrackingSpeed = 100000000000000n;
const mockBaseTotalSupply = 1000000000000000000000n; // 1e21
const mockBaseTotalBorrow = 500000000000000000000n; // 5e20

const mockCompToken = {
  tokenAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  symbol: 'USDT',
  decimals: BigInt(6n),
  price: '1.0',
  priceFeedAddress: '0x3E7d1eAB13ad0104d2750B8863b489D65364e32D',
};
const mockRewardToken = {
  tokenAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  symbol: 'USDT',
  decimals: BigInt(6n),
  price: '1.0',
  priceFeedAddress: '0x3E7d1eAB13ad0104d2750B8863b489D65364e32D'
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

describe('MarketMethods', () => {

  it('should correctly calculate APR from rate', () => {
    const result = MarketMethods.calcApr(mockRate);
    const expected = Number(mockRate * BigInt(SECONDS_PER_YEAR)) / 1e16; // Adjust precision
    expect(result).toBeCloseTo(expected, 5);
  });

  it('should handle zero rate', () => {
    expect(MarketMethods.calcApr(BigInt(0))).toBe(0);
  });

  it('should handle undefined rate', () => {
    expect(MarketMethods.calcApr(undefined)).toBe(0);
  });

  it('should calculate net APRs correctly for supply', () => {
    const supplyApr = 5.0;
    const result = MarketMethods.calcNetAprs(
        mockBaseToken,
        mockBaseTrackingSpeed,
        mockBaseTotalSupply,
        mockCompToken,
        [mockRewardToken],
        supplyApr
    );

    expect(result.length).toBe(3);
    expect(result[0]).toBe(supplyApr);
    expect(result[1]).toBeGreaterThanOrEqual(0);
    expect(result[2]).toBeGreaterThanOrEqual(0);
  });

  it('should handle zero total supply', () => {
    const result = MarketMethods.calcNetAprs(
        mockBaseToken,
        mockBaseTrackingSpeed,
        BigInt(0),
        mockCompToken,
        [mockRewardToken],
        5.0
    );

    expect(result[0]).toBe(5.0);
    expect(result[1]).toBe(0);
    expect(result[2]).toBe(0);
  });

  it('should delegate to calcNetAprs with supply parameters', () => {
    const supplyApr = 3.0;
    const result = MarketMethods.netEarnAprs(
        mockBaseToken,
        mockBaseTotalSupply,
        mockCompToken,
        [mockRewardToken],
        supplyApr
    );

    expect(result.length).toBe(3);
    expect(result[0]).toBe(supplyApr);
    expect(result[1]).toBeGreaterThanOrEqual(0);
    expect(result[2]).toBeGreaterThanOrEqual(0);
  });

  it('should delegate to calcNetAprs with borrow parameters', () => {
    const borrowApr = 4.0;
    const result = MarketMethods.netBorrowAprs(
        mockBaseToken,
        mockBaseTotalBorrow,
        mockCompToken,
        [mockRewardToken],
        borrowApr
    );

    expect(result.length).toBe(3);
    expect(result[0]).toBe(borrowApr);
    expect(result[1]).toBeGreaterThanOrEqual(0);
    expect(result[2]).toBeGreaterThanOrEqual(0);
  });

  it('calculates correctly with basic values', () => {
    const price = '2';
    const supply = 1000n;

    const result = MarketMethods.totalEarned(price, supply);
    expect(result).toBe(2000n);
  });

  it('handles decimal price correctly', () => {
    const price = '0.5';
    const supply = 4000n;

    const result = MarketMethods.totalEarned(price, supply);
    expect(result).toBe(2000n);
  });

  it('returns 0 for zero supply', () => {
    const result = MarketMethods.totalEarned('1.23', 0n);
    expect(result).toBe(0n);
  });

  it('returns 0 for zero price', () => {
    const result = MarketMethods.totalEarned('0', 1000n);
    expect(result).toBe(0n);
  });

  it('calculates correctly with basic values', () => {
    const price = '3';
    const borrowed = 100n;

    const result = MarketMethods.totalBorrowed(price, borrowed);
    expect(result).toBe(300n);
  });

  it('handles decimal price correctly', () => {
    const price = '0.25';
    const borrowed = 8000n;

    const result = MarketMethods.totalBorrowed(price, borrowed);
    expect(result).toBe(2000n);
  });

  it('returns 0 for zero borrowed', () => {
    const result = MarketMethods.totalBorrowed('4.56', 0n);
    expect(result).toBe(0n);
  });

  it('returns 0 for zero price', () => {
    const result = MarketMethods.totalBorrowed('0', 123n);
    expect(result).toBe(0n);
  });
});
