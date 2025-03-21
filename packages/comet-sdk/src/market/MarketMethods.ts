import { formatUnits, parseUnits } from "ethers";
import {
  COMET_FACTOR_DECIMALS,
  DAYS_PER_YEAR,
  ETH_SYMBOLS,
  PRICE_FEED_MANTISSA,
  SECONDS_PER_DAY,
  SECONDS_PER_YEAR,
} from "../constants";

/**
 * Namespace of utility functions to ease market-related calculations.
 */
export namespace MarketMethods {
  export function getAprCoef(rate = 0n): number {
    // Returns 0.xx format value
    // Borrow APR(%)= Borrow Rate / (10 ^ 18) * Seconds Per Year * 100
    // https://docs.compound.finance/interest-rates/
    if (!rate) return 0;
    const apr = rate * BigInt(SECONDS_PER_YEAR);
    return Number(formatUnits(apr, COMET_FACTOR_DECIMALS));
  }
  export function calcApr(rate?: bigint): number {
    // Returns 90.00000 % format value
    // Borrow APR(%)= Borrow Rate / (10 ^ 18) * Seconds Per Year * 100
    // https://docs.compound.finance/interest-rates/
    return getAprCoef(rate) * 100;
  }
  //
  export function totalEarning(
    baseTokenSymbol: string,
    baseTokenPrice: number,
    marketTotalSupply: bigint,
  ): bigint {
    // If the base asset is ETH or wstETH, its value is converted to USD based on the current price (baseToken.price).
    // For other assets, the value remains unchanged.
    if (ETH_SYMBOLS.includes(baseTokenSymbol)) {
      return BigInt(
        formatUnits(
          marketTotalSupply *
            parseUnits(
              baseTokenPrice.toFixed(PRICE_FEED_MANTISSA),
              PRICE_FEED_MANTISSA,
            ),
          PRICE_FEED_MANTISSA,
        ),
      );
    }
    return marketTotalSupply;
  }
  export function totalBorrowed(
    baseTokenSymbol: string,
    baseTokenPrice: number,
    marketTotalBorrow: bigint,
  ): bigint {
    // If the base asset is ETH or wstETH, its value is converted to USD based on the current price (baseToken.price).
    // For other assets, the value remains unchanged.
    if (ETH_SYMBOLS.includes(baseTokenSymbol)) {
      return BigInt(
        formatUnits(
          marketTotalBorrow *
            parseUnits(
              baseTokenPrice.toFixed(PRICE_FEED_MANTISSA),
              PRICE_FEED_MANTISSA,
            ),
          PRICE_FEED_MANTISSA,
        ),
      );
    }
    return marketTotalBorrow;
  }
  // netEarnAPR
  export function compToSuppliersPerDay(
    baseTrackingSupplySpeed: bigint,
    baseIndexScale: bigint,
  ): bigint {
    return (baseTrackingSupplySpeed / baseIndexScale) * BigInt(SECONDS_PER_DAY);
  }
  export function supplyCompRewardApr(
    compPriceInUsd: number, // ?: rename
    compDecimals: number,
    compToSuppliersPerDay: bigint,
    baseTotalSupply: bigint, // comet total supply
    basePriceInUsd: number, // ?: rename
    baseDecimals: number,
  ): number {
    // returns percents
    const nCompToSuppliersPerDay = Number(
      formatUnits(compToSuppliersPerDay, compDecimals),
    );
    const nBaseTotalSupply = Number(formatUnits(baseTotalSupply, baseDecimals));

    if (nBaseTotalSupply === 0 || basePriceInUsd === 0) {
      return 0;
    }

    const coefficient =
      ((compPriceInUsd * nCompToSuppliersPerDay) /
        (nBaseTotalSupply * basePriceInUsd)) *
      DAYS_PER_YEAR;
    return coefficient * 100;
  }
  export function netEarnApr(
    supplyApr: number,
    supplyCompRewardApr: number,
  ): number {
    // returns percents
    return supplyApr + supplyCompRewardApr;
  }
  // netBorrowApr
  export function compToBorrowersPerDay(
    baseTrackingBorrowSpeed: bigint,
    baseIndexScale: bigint,
  ): bigint {
    return (baseTrackingBorrowSpeed / baseIndexScale) * BigInt(SECONDS_PER_DAY);
  }
  export function borrowCompRewardApr(
    compPriceInUsd: number, // ?: rename
    compDecimals: number,
    compToBorrowersPerDay: bigint,
    baseTotalBorrow: bigint, // comet total supply
    basePriceInUsd: number, // ?: rename
    baseDecimals: number,
  ): number {
    // returns percents
    const nCompToBorrowersPerDay = Number(
      formatUnits(compToBorrowersPerDay, compDecimals),
    );
    const nBaseTotalBorrow = Number(formatUnits(baseTotalBorrow, baseDecimals));

    if (nBaseTotalBorrow === 0 || basePriceInUsd === 0) {
      return 0;
    }

    const coefficient =
      ((compPriceInUsd * nCompToBorrowersPerDay) /
        (nBaseTotalBorrow * basePriceInUsd)) *
      DAYS_PER_YEAR;
    return coefficient * 100;
  }
  export function netBorrowApr(
    borrowApr: number,
    borrowCompRewardApr: number,
  ): number {
    // returns percents
    return borrowApr + borrowCompRewardApr;
  }
}
