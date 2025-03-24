import type { IToken } from "../IToken";

export interface ICollateral extends IToken {
  collateralFactor: bigint; // 0 - only user can edit it, assetInfo -> borrowCollateralFactor, mock: 500000000000000000
  liquidationFactor: bigint; // 0 - only user can edit it, assetInfo -> liquidateCollateralFactor, mock: 700000000000000000
  liquidationPenalty: bigint; // 0 - only user can edit it, assetInfo -> liquidationFactor, mock: 750000000000000000
  supplyCap: bigint; // 0 - only user can edit it, assetInfo, mock: 100000000000000000000000
}
