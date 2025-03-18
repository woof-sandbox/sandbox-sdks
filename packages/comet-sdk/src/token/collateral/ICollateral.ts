import type { IToken } from "../IToken";

export interface ICollateral extends IToken {
  collateralFactor: bigint;
  liquidationFactor: bigint;
  liquidationPenalty: bigint;
  supplyCap: bigint;
}
