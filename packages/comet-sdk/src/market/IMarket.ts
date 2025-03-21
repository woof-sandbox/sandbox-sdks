import type { ICurve } from "../curve";
import type { IBase, ICollateral, IToken } from "../token";
import type { IMarketProposalTx } from "./IMarketProposalTx";

export interface IMarket {
  cometAddress: string;
  utilization: bigint;
  supplyRate: bigint;
  borrowRate: bigint;
  //
  totalBorrow: bigint;
  totalSupply: bigint; // or base total supply. comet.totalSupply()
  totalReserves: bigint;
  baseToken: IBase;
  collaterals: ICollateral[];
  availableLiquidity: bigint; // baseToken.balanceOf(CometAddress)
  // Config Controller
  configControllerAddress: string;
  owner: string; // address
  guardian: string; // address
  curator: string;
  feeDistribution: number; // percents
  //
  curvePreset: ICurve;
  //
  proposals: IMarketProposalTx[];
  //
  comp: IToken;
}
