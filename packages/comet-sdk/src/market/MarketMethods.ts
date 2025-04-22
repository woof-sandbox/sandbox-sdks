import { formatUnits, parseUnits } from "ethers";
import {
  COMET_FACTOR_DECIMALS,
  DAYS_PER_YEAR,
  PRICE_FEED_FACTOR_UNITS,
  SECONDS_PER_DAY,
  SECONDS_PER_YEAR,
} from "../constants";
import type { IBase, IToken } from "../token";

/**
 * Namespace of utility functions to ease market-related calculations.
 */
export namespace MarketMethods {
  function getAprCoef(rate = 0n): number {
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
  export function totalEarned(
    baseTokenPrice: string,
    marketTotalSupply: bigint, // or base total supply (takes from market)
  ): bigint {
    const priceInBigInt = parseUnits(baseTokenPrice, PRICE_FEED_FACTOR_UNITS);
    return (
      (marketTotalSupply * priceInBigInt) /
      BigInt(10 ** PRICE_FEED_FACTOR_UNITS)
    );
  }
  export function totalBorrowed(
    baseTokenPrice: string,
    marketTotalBorrow: bigint,
  ): bigint {
    const priceInBigInt = parseUnits(baseTokenPrice, PRICE_FEED_FACTOR_UNITS);
    return (
      (marketTotalBorrow * priceInBigInt) /
      BigInt(10 ** PRICE_FEED_FACTOR_UNITS)
    );
  }
  //
  //// NET calculations
  //
  function tokensToUsersPerDay(
    baseTrackingSpeed: bigint, // baseTrackingSupplySpeed or baseTrackingBorrowSpeed
    baseIndexScale: bigint,
  ): bigint {
    // "toUsers" means "toBorrowers" or "toSuppliers"
    return (baseTrackingSpeed / baseIndexScale) * BigInt(SECONDS_PER_DAY);
  }
  function tokenRewardApr(
    // supply or borrow, comp or just token
    tokenPrice: number, // USD
    tokenDecimals: bigint,
    tokenToUsersPerDay: bigint, // "toUsers" means "toBorrowers" or "toSuppliers"
    baseTotalBorrowOrSupply: bigint, // comet total supply or borrow
    basePriceInUsd: number,
    baseDecimals: bigint,
  ): number {
    // returns percents
    const nTokenToUsersPerDay = Number(
      formatUnits(tokenToUsersPerDay, tokenDecimals),
    );
    const nBaseTotalBorrow = Number(
      formatUnits(baseTotalBorrowOrSupply, baseDecimals),
    );

    if (nBaseTotalBorrow === 0 || basePriceInUsd === 0) {
      return 0;
    }

    const coefficient =
      ((tokenPrice * nTokenToUsersPerDay) /
        (nBaseTotalBorrow * basePriceInUsd)) *
      DAYS_PER_YEAR;
    return coefficient * 100;
  }

  /**
   * Calculates the APRs for borrow/supply, comp, and reward tokens.
   *
   * @param baseToken - The base token (e.g., the token being borrowed or supplied).
   * @param baseTrackingBorrowOrSupplySpeed - The tracking speed for borrowing or supplying.
   * @param baseTotalBorrowOrSupply - The total amount borrowed or supplied in the market.
   * @param compToken - The compound token used for rewards.
   * @param rewardTokens - Array of reward tokens (could be either supply or borrow tokens).
   * @param borrowOrSupplyApr - The APR for borrowing or supplying taken from the market.
   *
   * @returns An array where:
   *   - The first element is the APR for borrowing or supplying.
   *   - The second element is the APR for the compound token (compApr).
   *   - The subsequent elements are the APRs for each reward token (tokenRewardAprs[]).
   */
  export function calcNetAprs(
    baseToken: IBase,
    baseTrackingBorrowOrSupplySpeed: bigint,
    baseTotalBorrowOrSupply: bigint, // Market totalBorrowed or totalSupplied
    compToken: IToken,
    rewardTokens: IToken[],
    borrowOrSupplyApr: number,
  ): number[] {
    const tokenToUsers = tokensToUsersPerDay(
      baseTrackingBorrowOrSupplySpeed,
      baseToken.baseIndexScale,
    ); // ?: same for rewards and comp?

    const compApr = tokenRewardApr(
      Number(compToken.price),
      compToken.decimals,
      tokenToUsers,
      baseTotalBorrowOrSupply,
      Number(baseToken.price),
      baseToken.decimals,
    );

    const tokenRewardAprs = rewardTokens.map((token) =>
      tokenRewardApr(
        Number(token.price),
        token.decimals,
        tokenToUsers,
        baseTotalBorrowOrSupply,
        Number(baseToken.price),
        baseToken.decimals,
      ),
    );

    return [borrowOrSupplyApr, compApr, ...tokenRewardAprs];
  }

  /**
   * Calculates the net earned APR for supplied tokens, including the compound token and reward tokens.
   *
   * @param baseToken - The base token (e.g., the token being supplied).
   * @param totalSupplied - The total amount supplied in the market.
   * @param compToken - The compound token used for rewards.
   * @param rewardTokens - Array of reward tokens (supply tokens).
   * @param supplyApr - The APR for supplying tokens taken from the market.
   *
   * @returns An array where:
   *   - The first element is the APR for supplying tokens.
   *   - The second element is the APR for the compound token (compApr).
   *   - The subsequent elements are the APRs for each reward token (tokenRewardAprs[]).
   */
  export function netEarnAprs(
    baseToken: IBase,
    totalSupplied: bigint,
    compToken: IToken,
    rewardTokens: IToken[],
    supplyApr: number,
  ): number[] {
    return calcNetAprs(
      baseToken,
      baseToken.baseTrackingSupplySpeed,
      totalSupplied,
      compToken,
      rewardTokens,
      supplyApr,
    );
  }
  /**
   * Calculates the net earned APR for borrowed tokens, including the compound token and reward tokens.
   *
   * @param baseToken - The base token (e.g., the token being borrowed).
   * @param totalBorrowed - The total amount borrowed in the market.
   * @param compToken - The compound token used for rewards.
   * @param rewardTokens - Array of reward tokens (borrow tokens).
   * @param borrowApr - The APR for borrowing tokens taken from the market.
   *
   * @returns An array where:
   *   - The first element is the APR for borrowing tokens.
   *   - The second element is the APR for the compound token (compApr).
   *   - The subsequent elements are the APRs for each reward token (tokenRewardAprs[]).
   */
  export function netBorrowAprs(
    baseToken: IBase,
    totalBorrowed: bigint,
    compToken: IToken,
    rewardTokens: IToken[],
    borrowApr: number,
  ): number[] {
    return calcNetAprs(
      baseToken,
      baseToken.baseTrackingSupplySpeed,
      totalBorrowed,
      compToken,
      rewardTokens,
      borrowApr,
    );
  }
}
