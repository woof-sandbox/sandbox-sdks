import { Token } from "../Token";
import type { IBase } from "./IBase";

export class Base extends Token implements IBase {
  public baseMinForRewards: bigint;
  public baseTrackingBorrowSpeed: bigint;
  public baseTrackingSupplySpeed: bigint;

  constructor(baseData: IBase) {
    super(baseData);
    this.baseMinForRewards = baseData.baseMinForRewards;
    this.baseTrackingBorrowSpeed = baseData.baseTrackingBorrowSpeed;
    this.baseTrackingSupplySpeed = baseData.baseTrackingSupplySpeed;
  }
}
