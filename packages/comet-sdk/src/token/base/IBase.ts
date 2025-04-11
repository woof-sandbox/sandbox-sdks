import type { ICurve } from "../../curve";
import type { IToken } from "../IToken";

export interface IBase extends IToken {
  // mock: USDT
  baseMinBorrow: bigint; // takes from the sandbox controller? (exists on market as baseBorrowMin)
  baseMinForRewards: bigint; // 0 by default, take from comet, mock: 100000000000
  baseTrackingBorrowSpeed: bigint; // 0 by default, take from comet, mock: 578703703703
  baseTrackingSupplySpeed: bigint; // 0 by default, take from comet, mock: 810185185185
  baseIndexScale: bigint; // Takes from addition contract (under comet): Comet.baseIndexScale() works while is not showing on scan, mock: 1e15
  curvePresets: ICurve;
}
