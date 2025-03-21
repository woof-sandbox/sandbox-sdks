import type { ICurve } from "../../curve";
import type { IToken } from "../IToken";

export interface IBase extends IToken {
  baseMinForRewards: bigint; // 0 by default, take from comet
  baseTrackingBorrowSpeed: bigint; // 0 by default, take from comet
  baseTrackingSupplySpeed: bigint; // 0 by default, take from comet
  baseIndexScale: bigint; // Takes from addition contract (under comet): Comet.baseIndexScale() works while is not showing on scan
  curvePresets: ICurve[];
}
