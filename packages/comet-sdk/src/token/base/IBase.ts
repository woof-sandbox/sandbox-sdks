import type { Curve } from "../../curve";
import type { IToken } from "../IToken";

export interface IBase extends IToken {
  baseMinForRewards: bigint; // 0 by default, take from comet
  baseTrackingBorrowSpeed: bigint; // 0 by default, take from comet
  baseTrackingSupplySpeed: bigint; // 0 by default, take from comet
  curvePresets: Curve[];
}
