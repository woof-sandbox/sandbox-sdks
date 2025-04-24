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

  export function getSupplyCapUSD(
    supplyCap: bigint,
    decimals: bigint,
    price: string,
  ): number {
    return Number(formatUnits(supplyCap, Number(decimals))) * Number(price);
  }

  export function getRemainingCapacityUSD(
    totalSupplyUSD: number,
    supplyCapUSD: number,
  ): number {
    return supplyCapUSD - totalSupplyUSD;
  }

  export function getRemainingCapacityPercent(
    totalSupplyUSD: number,
    supplyCapUSD: number,
  ): number {
    const percentOfSupplyCap = supplyCapUSD / 100;
    return totalSupplyUSD / percentOfSupplyCap;
  }
}
