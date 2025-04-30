import { describe, it, expect, vi } from 'vitest';
import * as viem from 'viem';
import {CollateralMethods} from "../../src/token/collateral/CollateralMethods";

vi.mock('viem', () => ({
    formatUnits: vi.fn(),
}));

describe('CollateralMethods', () => {
    describe('getTotalSupplyUSD', () => {
        it('should return 0 when totalSupply is undefined', () => {
            const result = CollateralMethods.getTotalSupplyUSD(18n, '100');
            expect(result).toBe(0);
        });

        it('should calculate total supply USD correctly', () => {
            vi.mocked(viem.formatUnits).mockReturnValue('1000');
            const result = CollateralMethods.getTotalSupplyUSD(18n, '2.5', 1000n);
            expect(viem.formatUnits).toHaveBeenCalledWith(1000n, 18);
            expect(result).toBe(2500);
        });

        it('should handle zero values', () => {
            vi.mocked(viem.formatUnits).mockReturnValue('0');
            const result = CollateralMethods.getTotalSupplyUSD(18n, '100', 0n);
            expect(result).toBe(0);
        });

        it('should handle decimal price values', () => {
            vi.mocked(viem.formatUnits).mockReturnValue('100');
            const result = CollateralMethods.getTotalSupplyUSD(18n, '0.5', 100n);
            expect(result).toBe(50);
        });
    });

    describe('getCollateralReservesUSD', () => {
        it('should calculate collateral reserves USD correctly', () => {
            vi.mocked(viem.formatUnits).mockReturnValue('500');
            const result = CollateralMethods.getCollateralReservesUSD(500n, 18n, '2');
            expect(viem.formatUnits).toHaveBeenCalledWith(500n, 18);
            expect(result).toBe(1000);
        });

        it('should handle zero collateral reserves', () => {
            vi.mocked(viem.formatUnits).mockReturnValue('0');
            const result = CollateralMethods.getCollateralReservesUSD(0n, 18n, '100');
            expect(result).toBe(0);
        });

        it('should handle decimal price values', () => {
            vi.mocked(viem.formatUnits).mockReturnValue('1000');
            const result = CollateralMethods.getCollateralReservesUSD(1000n, 18n, '0.25');
            expect(result).toBe(250);
        });
    });

    describe('getCollateralPercent', () => {
        it('should calculate collateral percent correctly', () => {
            vi.mocked(viem.formatUnits).mockReturnValue('0.75');
            const result = CollateralMethods.getCollateralPercent(750000000000000000n);
            expect(viem.formatUnits).toHaveBeenCalledWith(750000000000000000n, 18);
            expect(result).toBe(75);
        });

        it('should handle zero collateral factor', () => {
            vi.mocked(viem.formatUnits).mockReturnValue('0');
            const result = CollateralMethods.getCollateralPercent(0n);
            expect(result).toBe(0);
        });

        it('should handle maximum collateral factor (100%)', () => {
            vi.mocked(viem.formatUnits).mockReturnValue('1');
            const result = CollateralMethods.getCollateralPercent(1000000000000000000n);
            expect(result).toBe(100);
        });
    });

    describe('getSupplyCapUSD', () => {
        it('should calculate supply cap USD correctly', () => {
            vi.mocked(viem.formatUnits).mockReturnValue('1000');
            const result = CollateralMethods.getSupplyCapUSD(1000n, 18n, '3');
            expect(viem.formatUnits).toHaveBeenCalledWith(1000n, 18);
            expect(result).toBe(3000);
        });

        it('should handle zero supply cap', () => {
            vi.mocked(viem.formatUnits).mockReturnValue('0');
            const result = CollateralMethods.getSupplyCapUSD(0n, 18n, '100');
            expect(result).toBe(0);
        });

        it('should handle decimal price values', () => {
            vi.mocked(viem.formatUnits).mockReturnValue('500');
            const result = CollateralMethods.getSupplyCapUSD(500n, 18n, '0.1');
            expect(result).toBe(50);
        });
    });

    describe('getRemainingCapacityUSD', () => {
        it('should calculate remaining capacity USD correctly', () => {
            const result = CollateralMethods.getRemainingCapacityUSD(2000, 5000);
            expect(result).toBe(3000);
        });

        it('should handle zero total supply', () => {
            const result = CollateralMethods.getRemainingCapacityUSD(0, 1000);
            expect(result).toBe(1000);
        });

        it('should handle equal supply and cap', () => {
            const result = CollateralMethods.getRemainingCapacityUSD(1000, 1000);
            expect(result).toBe(0);
        });

        it('should handle negative remaining capacity', () => {
            const result = CollateralMethods.getRemainingCapacityUSD(6000, 5000);
            expect(result).toBe(-1000);
        });
    });

    describe('getRemainingCapacityPercent', () => {
        it('should calculate remaining capacity percent correctly', () => {
            const result = CollateralMethods.getRemainingCapacityPercent(2500, 10000);
            expect(result).toBe(25);
        });

        it('should handle zero total supply', () => {
            const result = CollateralMethods.getRemainingCapacityPercent(0, 1000);
            expect(result).toBe(0);
        });

        it('should handle zero supply cap', () => {
            const result = CollateralMethods.getRemainingCapacityPercent(1000, 0);
            expect(result).toBe(Infinity);
        });

        it('should handle full capacity used', () => {
            const result = CollateralMethods.getRemainingCapacityPercent(1000, 1000);
            expect(result).toBe(100);
        });
    });
});