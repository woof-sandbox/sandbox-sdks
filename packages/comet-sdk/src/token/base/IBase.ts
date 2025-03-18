import type { IToken } from "../IToken";

export interface IBase extends IToken {
  baseMinForRewards: bigint;
  baseTrackingBorrowSpeed: bigint;
  baseTrackingSupplySpeed: bigint;
}
