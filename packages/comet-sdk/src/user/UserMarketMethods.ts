import { type Address, formatUnits, parseUnits } from "viem";
import {
  COMET_FACTOR_DECIMALS,
  NON_USD_BASE_SYMBOLS,
  PRICE_FEED_FACTOR_UNITS,
} from "../constants";
import { MISSING_COLLATERAL_DATA } from "../errors/methods/user-market-methods.errors";
import { MarketMethods } from "../market";
import type { IBase, IToken } from "../token";
import { DataUtils } from "../utils";
import type { UserCollateral } from "./UserCollateral";
import type { MultiAllowanceCallType } from "./entities/multi-allowance-call";
import type { MultiAllowanceResponseType } from "./entities/multi-allowance-result";

export namespace UserMarketMethods {
  export function borrowBalanceUsd(
    borrowBalance: bigint,
    baseDecimals: bigint,
    basePriceUsd: string,
  ): number {
    const borrowAmount = DataUtils.fromBigNumber(
      borrowBalance,
      Number(baseDecimals),
    );

    return Number(borrowAmount) * Number(basePriceUsd);
  }

  export function supplyBalanceUsd(
    supplyBalance: bigint,
    baseDecimals: bigint,
    basePriceUsd: string,
  ): number {
    const supplyAmount = DataUtils.fromBigNumber(
      supplyBalance,
      Number(baseDecimals),
    );

    return Number(supplyAmount) * Number(basePriceUsd);
  }

  export function tokenPrice(
    symbol: string,
    tokenPrice: bigint,
    basePriceUsd: string,
  ): number {
    return NON_USD_BASE_SYMBOLS.has(symbol)
      ? Number(formatUnits(tokenPrice, PRICE_FEED_FACTOR_UNITS)) *
          Number(basePriceUsd)
      : Number(formatUnits(tokenPrice, PRICE_FEED_FACTOR_UNITS));
  }

  export function borrowCollateralValueUSD(
    collaterals: UserCollateral[],
    basePriceUsd: string,
  ): number {
    return collaterals
      .map(
        (collateral) =>
          Number(
            formatUnits(
              collateral.userSupplyBalance[0] ?? 0n,
              Number(collateral.decimals),
            ),
          ) *
          tokenPrice(
            collateral.symbol,
            DataUtils.toBigNumber(collateral.price, PRICE_FEED_FACTOR_UNITS),
            basePriceUsd,
          ),
      )
      .reduce((a: number, b: number) => a + b, 0);
  }

  export function borrowCollateralValueCustomUsd(
    collaterals: UserCollateral[],
    customCollaterals: { address: string; value: string }[],
    basePriceUsd: string,
  ): number {
    return collaterals
      .map((collateral) => {
        const collateralData =
          customCollaterals.find(
            (data) => data.address === collateral.tokenAddress,
          )?.value || "0";
        return (
          (Number(
            formatUnits(
              collateral.userSupplyBalance[0] ?? 0n,
              Number(collateral.decimals),
            ),
          ) +
            Number(collateralData)) *
          tokenPrice(
            collateral.symbol,
            DataUtils.toBigNumber(collateral.price, PRICE_FEED_FACTOR_UNITS),
            basePriceUsd,
          )
        );
      })
      .reduce((a: number, b: number) => a + b, 0);
  }

  export function borrowCapacityMarketUsd(
    collaterals: UserCollateral[],
    basePriceUsd: string,
  ): number {
    return collaterals
      .map(
        (collateral) =>
          Number(
            formatUnits(
              collateral.userSupplyBalance[0] ?? 0n,
              Number(collateral.decimals),
            ),
          ) *
          Number(
            formatUnits(collateral.liquidationFactor, COMET_FACTOR_DECIMALS),
          ) *
          tokenPrice(
            collateral.symbol,
            DataUtils.toBigNumber(collateral.price, PRICE_FEED_FACTOR_UNITS),
            basePriceUsd,
          ),
      )
      .reduce((a: number, b: number) => a + b, 0);
  }

  export function borrowCapacityMarketCustomUsd(
    collaterals: UserCollateral[],
    customCollaterals: { address: string; value: string }[],
    basePriceUsd: string,
  ): number {
    return collaterals
      .map((collateral) => {
        const collateralData =
          customCollaterals.find(
            (data) => data.address === collateral.tokenAddress,
          )?.value || "0";
        return (
          (Number(
            formatUnits(
              collateral.userSupplyBalance[0] ?? 0n,
              Number(collateral.decimals),
            ),
          ) +
            Number(collateralData)) *
          Number(
            formatUnits(collateral.liquidationFactor, COMET_FACTOR_DECIMALS),
          ) *
          tokenPrice(
            collateral.symbol,
            DataUtils.toBigNumber(collateral.price, PRICE_FEED_FACTOR_UNITS),
            basePriceUsd,
          )
        );
      })
      .reduce((a: number, b: number) => a + b, 0);
  }

  export function maxWithdrawCollateralAmount(
    borrowCapacityUsd: number,
    supplyBalance: bigint,
    borrowBalance: bigint,
    baseDecimals: bigint,
    basePriceUsd: string,
  ) {
    const supplyAmount = DataUtils.fromBigNumber(
      supplyBalance,
      Number(baseDecimals),
    );

    const borrowBalanceUSD =
      Number(DataUtils.fromBigNumber(borrowBalance, Number(baseDecimals))) *
      Number(basePriceUsd);

    const availableToBorrow = borrowCapacityUsd - borrowBalanceUSD;

    if (borrowBalance > 0n) {
      return (availableToBorrow / Number(basePriceUsd)).toString();
    } else {
      return supplyAmount;
    }
  }

  export function findMarketCollateralByAddress(
    collateralAddress: Address,
    collaterals: UserCollateral[],
  ) {
    return collaterals.find(
      (marketCollateral) =>
        marketCollateral.tokenAddress.toLowerCase() ===
        collateralAddress.toLowerCase(),
    );
  }

  function isTokenAllowanceTooSmall(tokenAmount: bigint, allowance?: bigint) {
    if (!allowance) {
      return true;
    }
    return tokenAmount > allowance;
  }

  export function isSomeTokenAllowanceTooSmall(
    collaterals: UserCollateral[],
    collateralsAllowances: MultiAllowanceResponseType[],
  ) {
    return collateralsAllowances.some((collateral) => {
      const currentCollateralData = findMarketCollateralByAddress(
        collateral.tokenAddress,
        collaterals,
      );

      if (!currentCollateralData) throw MISSING_COLLATERAL_DATA();

      return isTokenAllowanceTooSmall(
        DataUtils.toBigNumber(
          collateral.inputAmount,
          Number(currentCollateralData.decimals),
        ),
        collateral.allowance,
      );
    });
  }

  export function isAllCollateralsFromMarket(
    collaterals: UserCollateral[],
    supplyCollaterals: MultiAllowanceCallType[],
  ) {
    return supplyCollaterals
      .map(({ tokenAddress }) => tokenAddress)
      .every((tokenAddress) =>
        collaterals
          .map((marketCollateral) =>
            marketCollateral.tokenAddress.toLowerCase(),
          )
          .includes(tokenAddress),
      );
  }

  export function availableToBorrow(
    collaterals: UserCollateral[],
    basePriceUsd: string,
    borrowBalance: bigint,
  ) {
    const borrowCapacity =
      collaterals
        .map(
          (collateral) =>
            Number(
              formatUnits(
                collateral.userSupplyBalance[0] ?? 0n,
                Number(collateral.decimals),
              ),
            ) *
            Number(
              formatUnits(collateral.collateralFactor, COMET_FACTOR_DECIMALS),
            ) *
            tokenPrice(
              collateral.symbol,
              parseUnits(collateral.price, PRICE_FEED_FACTOR_UNITS),
              basePriceUsd,
            ),
        )
        .reduce((a: number, b: number) => a + b) / 1.5;

    const borrow = Number(borrowBalance) * Number(basePriceUsd);

    const availableToBorrow = (borrowCapacity - borrow) / Number(basePriceUsd);

    return availableToBorrow.toString();
  }

  export function netBorrowAprsCustom(
    userBorrowValue: string,
    baseToken: IBase,
    totalBorrowed: bigint,
    compToken: IToken,
    rewardTokens: IToken[],
    borrowApr: number,
  ): number[] {
    return MarketMethods.netBorrowAprs(
      baseToken,
      totalBorrowed + parseUnits(userBorrowValue, Number(baseToken.decimals)),
      compToken,
      rewardTokens,
      borrowApr,
    );
  }
}
