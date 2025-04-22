import type { ICollateral } from "../token";

export interface IUserCollateral extends ICollateral {
  userBalance: bigint;
  userSupplyBalance: bigint[];
}
