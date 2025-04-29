import type { IMarket } from "../market";
import type { UserCollateral } from "./UserCollateral";

export interface IUserMarket extends IMarket {
  borrowBalance: bigint;
  supplyBalance: bigint;
  baseTokenBalance: bigint;
  collaterals: UserCollateral[];
}
