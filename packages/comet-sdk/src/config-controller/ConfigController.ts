import type { IConfigController } from "./IConfigController";

export class ConfigController implements IConfigController {
  address: `0x${string}`;
  owner: `0x${string}`;
  guardian: `0x${string}`;
  curator: `0x${string}`;
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
