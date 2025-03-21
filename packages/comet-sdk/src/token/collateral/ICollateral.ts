import type { IToken } from "../IToken";

export interface ICollateral extends IToken {
  collateralFactor: bigint; // 0 - only user can edit it
  liquidationFactor: bigint; // 0 - only user can edit it
  liquidationPenalty: bigint; // 0 - only user can edit it
  supplyCap: bigint; // 0 - only user can edit it
}
