import type { Curve } from "../curve";
import type { Base, Collateral } from "../token";
import type { Token } from "../token/Token";
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
  baseToken: Base;
  collaterals: Collateral[];
  availableLiquidity: bigint; // baseToken.balanceOf(CometAddress)
  // Config Controller
  configControllerAddress: string;
  owner: string; // address
  guardian: string; // address
  curator: string;
  feeDistribution: number; // percents
  //
  curvePreset: Curve;
  //
  proposals: IMarketProposalTx[];
  //
  comp: Token;
}
