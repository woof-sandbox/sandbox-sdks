import type { ICollateralParams } from "../token";

export interface IMarketProposalTx {
  name: string; // --
  date: Date; // --
  txHash: string; // --
  // Collateral parameters for market creation/set:
  collateralsParams: ICollateralParams[]; // --
}
