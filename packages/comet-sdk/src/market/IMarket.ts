import type { Curve } from "../curve";
import type { Base, Collateral } from "../token";

export interface IMarket {
  cometAddress: string;
  utilization: bigint;
  supplyRate: bigint;
  borrowRate: bigint;
  //
  totalBorrow: bigint;
  totalSupply: bigint;
  totalReserves: bigint;
  baseToken: Base;
  collaterals: Collateral[];
  availableLiquidity: bigint; // todo: baseToken.balanceOf(CometAddress)
  // Config Controller
  configControllerAddress: string;
  owner: string;
  curator: string;
  feeDistribution: number; // percents
  //
  curvePreset: Curve;
}
