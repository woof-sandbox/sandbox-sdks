import { type Address, formatUnits, parseUnits } from "viem";
import {
  COMET_FACTOR_DECIMALS,
  PRICE_FEED_FACTOR_UNITS,
} from "../constants";
import type { ICurve } from "../curve";
import { MISSING_COLLATERAL_DATA } from "../errors/methods/user-market-methods.errors";
import { MarketMethods } from "../market";
import type { IBase, IToken } from "../token";
import { DataUtils } from "../utils";
import type { ICustomCollateral } from "./ICustomCollateral";
import type { UserCollateral } from "./UserCollateral";
import type { MultiAllowanceResponseType } from "./entities/multi-allowance-result";
import { scaleToDecimals } from '../utils';

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
    tokenPrice: bigint,
    basePriceUsd: string,
    usdToken = false,
    priceDecimals = PRICE_FEED_FACTOR_UNITS,
  ): number {
    return !usdToken
      ? Number(formatUnits(tokenPrice, priceDecimals)) *
          Number(basePriceUsd)
      : Number(formatUnits(tokenPrice, priceDecimals));
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
              collateral.userSupplyBalance ?? 0n,
              Number(collateral.decimals),
            ),
          ) *
          tokenPrice(
            DataUtils.toBigNumber(collateral.price, Number(collateral.decimals)),
            basePriceUsd,
          ),
      )
      .reduce((a: number, b: number) => a + b, 0);
  }

  export function borrowCollateralValueCustomUsd(
    collaterals: UserCollateral[],
    customCollaterals: ICustomCollateral[],
    basePriceUsd: string,
  ): number {
    return collaterals
      .map((collateral) => {
        const collateralData =
          customCollaterals.find(
            (data) => data.tokenAddress === collateral.tokenAddress,
          )?.inputAmount || "0";
        return (
          (Number(
            formatUnits(
              collateral.userSupplyBalance ?? 0n,
              Number(collateral.decimals),
            ),
          ) +
            Number(collateralData)) *
          tokenPrice(
            DataUtils.toBigNumber(collateral.price, Number(collateral.decimals)),
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
              collateral.userSupplyBalance ?? 0n,
              Number(collateral.decimals),
            ),
          ) *
          Number(
            formatUnits(collateral.liquidationFactor, scaleToDecimals(collateral.cometScale)),
          ) *
          tokenPrice(
            DataUtils.toBigNumber(collateral.price, Number(collateral.decimals)),
            basePriceUsd,
          ),
      )
      .reduce((a: number, b: number) => a + b, 0);
  }

  export function borrowCapacityMarketCustomUsd(
    collaterals: UserCollateral[],
    customCollaterals: ICustomCollateral[],
    basePriceUsd: string,
  ): number {
    return collaterals
      .map((collateral) => {
        const collateralData =
          customCollaterals.find(
            (data) => data.tokenAddress === collateral.tokenAddress,
          )?.inputAmount || "0";
        return (
          (Number(
            formatUnits(
              collateral.userSupplyBalance ?? 0n,
              Number(collateral.decimals),
            ),
          ) +
            Number(collateralData)) *
          Number(
            formatUnits(collateral.liquidationFactor, scaleToDecimals(collateral.cometScale)),
          ) *
          tokenPrice(
            DataUtils.toBigNumber(collateral.price, Number(collateral.decimals)),
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
    return collateralsAllowances
      .filter((collateral) => !collateral.isNative)
      .some((collateral) => {
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
    supplyCollaterals: ICustomCollateral[],
  ) {
    return supplyCollaterals
      .map(({ tokenAddress }) => tokenAddress.toLowerCase())
      .every((tokenAddress) =>
        collaterals
          .map((marketCollateral) =>
            marketCollateral.tokenAddress.toLowerCase(),
          )
          .includes(tokenAddress.toLowerCase()),
      );
  }

  export function availableToBorrow(
    collaterals: UserCollateral[],
    basePriceUsd: string,
    borrowBalance: bigint,
  ) {
    const borrowCapacity = collaterals
      .map(
        (collateral) =>
          Number(
            formatUnits(
              collateral.userSupplyBalance ?? 0n,
              Number(collateral.decimals),
            ),
          ) *
          Number(
            formatUnits(collateral.collateralFactor, scaleToDecimals(collateral.cometScale)),
          ) *
          tokenPrice(
            parseUnits(collateral.price, Number(collateral.decimals)),
            basePriceUsd,
          ),
      )
      .reduce((a: number, b: number) => a + b);

    const decimals = collaterals[0]?.decimals
      ? Number(collaterals[0].decimals)
      : COMET_FACTOR_DECIMALS;
    const borrow =
      Number(formatUnits(borrowBalance, decimals)) * Number(basePriceUsd);

    const availableToBorrow = (borrowCapacity - borrow) / Number(basePriceUsd);

    return availableToBorrow.toString();
  }

  function calculateUtilization(
    totalBorrow: bigint,
    totalSupply: bigint,
  ): bigint {
    if (totalSupply === 0n) return 0n;

    return (totalBorrow * 10n ** 18n) / totalSupply;
  }

  export function earnAprCustom(
    userSupplyValue: string,
    baseToken: IBase,
    totalSupplied: bigint,
    totalBorrowed: bigint,
    curvePresets: ICurve,
  ) {
    const totalSupply =
      totalSupplied +
      DataUtils.toBigNumber(userSupplyValue, Number(baseToken.decimals));

    const utilization = calculateUtilization(totalBorrowed, totalSupply);

    return MarketMethods.getApr(
      utilization,
      curvePresets.supplyKink,
      curvePresets.supplyPerYearInterestRateBase,
      curvePresets.supplyPerYearInterestRateSlopeLow,
      curvePresets.supplyPerYearInterestRateSlopeHigh,
    );
  }

  function calculateApr(
    utilization: bigint,
    kink: bigint,
    baseRate: bigint,
    slopeLow: bigint,
    slopeHigh: bigint,
  ): number {
    let rate: bigint;

    if (utilization <= kink) {
      rate = baseRate + (slopeLow * utilization) / 10n ** 18n;
    } else {
      const slopeLowPart = (slopeLow * kink) / 10n ** 18n;
      const slopeHighPart = (slopeHigh * (utilization - kink)) / 10n ** 18n;
      rate = baseRate + slopeLowPart + slopeHighPart;
    }

    return (Number(rate) / 1e18) * 100;
  }

  export function borrowAprCustom(
    userBorrowValue: string,
    baseToken: IBase,
    totalSupplied: bigint,
    totalBorrowed: bigint,
    curvePresets: ICurve,
  ): number {
    const userBorrowAmount = DataUtils.toBigNumber(
      userBorrowValue,
      Number(baseToken.decimals),
    );

    const updatedTotalBorrowed = totalBorrowed + userBorrowAmount;

    const utilization = calculateUtilization(
      updatedTotalBorrowed,
      totalSupplied,
    );

    return calculateApr(
      utilization,
      curvePresets.borrowKink,
      curvePresets.borrowPerYearInterestRateBase,
      curvePresets.borrowPerYearInterestRateSlopeLow,
      curvePresets.borrowPerYearInterestRateSlopeHigh,
    );
  }

  export function netEarnAprsCustom(
    userSupplyValue: string,
    baseToken: IBase,
    totalSupplied: bigint,
    compToken: IToken,
    rewardTokens: IToken[],
    supplyApr: number,
  ): number[] {
    return MarketMethods.netEarnAprs(
      baseToken,
      totalSupplied + parseUnits(userSupplyValue, Number(baseToken.decimals)),
      compToken,
      rewardTokens,
      supplyApr,
    );
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
