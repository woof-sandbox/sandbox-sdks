import type { IUserCollateral } from "./IUserCollateral";
import { Collateral } from "../token";

export class UserCollateral extends Collateral implements IUserCollateral {
  public userBalance: bigint;
  public userSupplyBalance: bigint;

  constructor(collateralData: IUserCollateral) {
    super(collateralData);
    this.userBalance = collateralData.userBalance;
    this.userSupplyBalance = collateralData.userSupplyBalance;
  }
}
