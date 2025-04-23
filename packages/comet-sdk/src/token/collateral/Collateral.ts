import { Token } from "../Token";
import type { ICollateral } from "./ICollateral";

export class Collateral extends Token implements ICollateral {
  public collateralFactor: bigint;
  public liquidationFactor: bigint;
  public liquidationPenalty: bigint;
  public supplyCap: bigint;
  public cometBalance: bigint;

  constructor(collateralData: ICollateral) {
    super(collateralData);
    this.collateralFactor = collateralData.collateralFactor;
    this.liquidationFactor = collateralData.liquidationFactor;
    this.liquidationPenalty = collateralData.liquidationPenalty;
    this.supplyCap = collateralData.supplyCap;
    this.cometBalance = collateralData.cometBalance;
  }
}
