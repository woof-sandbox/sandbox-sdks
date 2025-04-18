import type { IMarket } from "../market";
import type { IUserCollateral } from "./IUserCollateral";

export interface IUserMarket extends IMarket {
  borrowBalance: bigint;
  supplyBalance: bigint;
  baseTokenBalance: bigint;
  collaterals: IUserCollateral[];
}
