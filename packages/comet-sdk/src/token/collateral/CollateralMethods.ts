import { formatUnits } from "viem";

export namespace CollateralMethods {
  export function getTotalSupplyUSD(
    decimals: bigint,
    price: string,
    totalSupply?: bigint,
  ): number {
    if (!totalSupply) {
      return 0;
    }
    return Number(formatUnits(totalSupply, Number(decimals))) * Number(price);
  }

  export function getCollateralReservesUSD(
    collateralReserves: bigint,
    decimals: bigint,
    price: string,
  ): number {
    return (
      Number(formatUnits(collateralReserves, Number(decimals))) * Number(price)
    );
  }

  export function getCollateralPercent(collateralFactor: bigint): number {
    return Number(formatUnits(collateralFactor, 18)) * 100;
  }
}
