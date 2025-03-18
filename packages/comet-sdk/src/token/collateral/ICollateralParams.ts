// Uses for market creation/proposal
export interface ICollateralParams {
  collateralFactor: bigint;
  liquidationFactor: bigint;
  liquidationPenalty: bigint;
  supplyCap: bigint;
}
