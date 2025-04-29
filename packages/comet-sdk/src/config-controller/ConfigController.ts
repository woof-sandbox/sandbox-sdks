import type { Address } from "viem";
import type { IConfigController } from "./IConfigController";

export class ConfigController implements IConfigController {
  address: Address;
  owner: Address;
  guardian: Address;
  curator: Address;
  curatorFee: number;
  marketsLength: number;
  revenueTokensLength: number;

  constructor(configControllerData: IConfigController) {
    this.address = configControllerData.address;
    this.owner = configControllerData.owner;
    this.guardian = configControllerData.guardian;
    this.curator = configControllerData.curator;
    this.curatorFee = configControllerData.curatorFee;
    this.marketsLength = configControllerData.marketsLength;
    this.revenueTokensLength = configControllerData.revenueTokensLength;
  }
}
