import type { IBase, ICollateral } from "../token";
import type { ISandboxController } from "./ISandboxController";

export class SandboxController implements ISandboxController {
  address: string;
  baseWhitelist: IBase[];
  collateralsWhitelist: ICollateral[];
  storeFrontPriceFactor: number;

  constructor(controllerData: ISandboxController) {
    this.address = controllerData.address;
    this.baseWhitelist = controllerData.baseWhitelist;
    this.collateralsWhitelist = controllerData.collateralsWhitelist;
    this.storeFrontPriceFactor = controllerData.storeFrontPriceFactor;
  }
}
