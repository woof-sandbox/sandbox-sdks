import { JsonRpcProvider, formatUnits } from "ethers";

// TODO: move to constants
const PRICE_FEED_MANTISSA = 8;
const DAYS_IN_THE_YEAR = 365;
const SECONDS_PER_YEAR = 60 * 60 * 24 * 365;

// TODO: move logic to market entity
export class MarketRatesService {
  private readonly provider: JsonRpcProvider;

  constructor(rpcUrl: string) {
    this.provider = new JsonRpcProvider(rpcUrl);
  }

  private calcSupplyApr(supplyRate: bigint, baseDecimal: number): number {
    return (
      Number(formatUnits(supplyRate, baseDecimal)) * SECONDS_PER_YEAR * 100
    );
  }
  private calcBorrowApr(borrowRate: bigint, baseDecimal: number): number {
    return (
      Number(formatUnits(borrowRate, baseDecimal)) * SECONDS_PER_YEAR * 100
    );
  }

  private calcSupplyCompRewardApr(
    compPriceInUsd: number,
    compToSuppliersPerDay: number,
    baseTotalSupply: number,
    usdcPriceInUsd: number,
  ) {
    // ?: bigint
    return (
      ((compPriceInUsd * compToSuppliersPerDay) /
        (baseTotalSupply * usdcPriceInUsd)) *
      DAYS_IN_THE_YEAR *
      100
    );
  }
  private calcBorrowCompRewardApr(
    compPriceInUsd: number,
    compToBorrowersPerDay: number,
    baseTotalBorrow: number,
    usdcPriceInUsd: number,
  ) {
    // ?: bigint
    return (
      ((compPriceInUsd * compToBorrowersPerDay) /
        (baseTotalBorrow * usdcPriceInUsd)) *
      DAYS_IN_THE_YEAR *
      100
    );
  }

  private calcNetBorrowAPY(
    borrowApr: number,
    borrowCompRewardApr: number,
  ): number {
    return borrowApr - borrowCompRewardApr;
  }
  private calcNetEarnAPY(
    supplyApr: number,
    supplyCompRewardApr: number,
  ): number {
    return supplyApr + supplyCompRewardApr;
  }

  // For non-weth it is just baseTotalSupply
  private calcTotalEarningWeth(
    baseTotalSupply: number,
    ethPrice: number,
  ): number {
    return baseTotalSupply * ethPrice;
  }
  // For non-weth it is just baseTotalBorrow
  private calcTotalBorrowedWeth(
    baseTotalBorrow: number,
    ethPrice: number,
  ): number {
    return baseTotalBorrow * ethPrice;
  }

  private calcTotalAll(totalEarning: number, totalBorrowed: number): number {
    return totalEarning + totalBorrowed;
  }

  // TODO: move to tokens
  private calcTokenPrice(
    symbol: string,
    tokenPrice: number,
    marketPrice: number,
  ): number {
    if (symbol === "ETH" || symbol === "wstETH") {
      return Number(formatUnits(tokenPrice, PRICE_FEED_MANTISSA)) * marketPrice;
    }
    return Number(formatUnits(tokenPrice, PRICE_FEED_MANTISSA));
  }

  // TODO: move to user
  private calcTotalSuppliedUSD(
    collaterals: {
      totalSupply: bigint;
      decimals: number;
      liquidationFactor: bigint;
      price: number;
      marketData: { asset: string; price: number };
    }[],
  ) {
    return collaterals.map((c) => {
      const collateralsSupply = Number(formatUnits(c.totalSupply, c.decimals));

      const liqFactor = Number(formatUnits(c.liquidationFactor, 18));

      const collateralPrice = this.calcTokenPrice(
        c.marketData.asset,
        c.price,
        c.marketData.price,
      );

      // liquidationFactors.push(liqFactor);
      return collateralsSupply * collateralPrice;
    });
  }
  private calcHealthFactor(
    totalSuppliedUSD: number,
    borrowAmountUSD: number,
    midlLiquidationFactors: number,
  ): number {
    return (totalSuppliedUSD * midlLiquidationFactors) / borrowAmountUSD;
  }
}
