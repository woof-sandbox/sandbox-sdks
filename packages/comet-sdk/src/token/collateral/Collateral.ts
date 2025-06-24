import { Token } from "../Token";
import { CollateralMethods } from "./CollateralMethods";
import type { ICollateral } from "./ICollateral";

export class Collateral extends Token implements ICollateral {
  public collateralFactor: bigint;
  public liquidationFactor: bigint;
  public liquidationPenalty: bigint;
  public supplyCap: bigint;
  public cometBalance: bigint;
  public collateralReserves: bigint;
  public totalSupplyAsset: bigint;

  constructor(collateralData: ICollateral) {
    super(collateralData);
    this.collateralFactor = collateralData.collateralFactor;
    this.liquidationFactor = collateralData.liquidationFactor;
    this.liquidationPenalty = collateralData.liquidationPenalty;
    this.supplyCap = collateralData.supplyCap;
    this.cometBalance = collateralData.cometBalance;
    this.collateralReserves = collateralData.collateralReserves;
    this.totalSupplyAsset = collateralData.totalSupplyAsset;
  }

  get totalSupplyAssetUSD(): number {
    return CollateralMethods.getTotalSupplyUSD(
      this.decimals,
      this.price,
      this.totalSupplyAsset,
    );
  }

  get supplyCapUSD(): number {
    return CollateralMethods.getSupplyCapUSD(
      this.supplyCap,
      this.decimals,
      this.price,
    );
  }

  get remainingCapacityUSD(): number {
    return CollateralMethods.getRemainingCapacityUSD(
      this.totalSupplyAssetUSD,
      this.supplyCapUSD,
    );
  }

  get remainingCapacityPercent(): number {
    return CollateralMethods.getRemainingCapacityPercent(
      this.totalSupplyAssetUSD,
      this.supplyCapUSD,
    );
  }

  get collateralReservesUSD(): number {
    return CollateralMethods.getCollateralReservesUSD(
      this.collateralReserves,
      this.decimals,
      this.price,
    );
  }

  get collateralFactorPercent(): number {
    return CollateralMethods.getCollateralPercent(this.collateralFactor);
  }

  get liquidationFactorPercent(): number {
    return CollateralMethods.getCollateralPercent(this.liquidationFactor);
  }

  get liquidationPenaltyPercent(): number {
    return CollateralMethods.getCollateralPercent(this.liquidationPenalty);
  }
}
