import type { IBase, ICollateral, IToken } from "../token";
import type { IMarketProposalTx } from "./IMarketProposalTx";

export interface IMarket {
  // mock: USDT
  cometAddress: string; // mock: 0x3Afdc9BCA9213A35503b077a6072F3D0d5AB0840
  utilization: bigint; // mock: 622155096290286592
  supplyRate: bigint; // mock: 1065334068
  borrowRate: bigint; // mock: 1462067313
  //
  totalBorrow: bigint; // mock: 115139196488456
  totalSupply: bigint; // or base total supply. comet.totalSupply(), mock: 185064689883219
  totalReserves: bigint; // mock: 1368714199302
  baseToken: IBase;
  collaterals: ICollateral[];
  availableLiquidity: bigint; // baseToken.balanceOf(CometAddress), mock: 71294244719270
  // Config Controller
  configControllerAddress: string; // mock: --
  ownerAddress: string; // address, mock: --
  guardianAddress: string; // address, mock: --
  curatorAddress: string; // mock: --
  feeDistribution: number; // percents, mock: --
  //
  proposals: IMarketProposalTx[];
  //
  comp: IToken; // --
}
