import type { Curve } from "../curve";
import type { Base, Collateral } from "../token";
import type { ISandboxController } from "./ISandboxController";

export class SandboxController implements ISandboxController {
  address: string;
  baseWhitelist: Base[];
  collateralsWhitelist: Collateral[];
  priceFeedsAddresses: string[];
  curvePresets: Curve[];
  storeFrontPriceFactor: number;

  constructor(controllerData: ISandboxController) {
    this.address = controllerData.address;
    this.baseWhitelist = controllerData.baseWhitelist;
    this.collateralsWhitelist = controllerData.collateralsWhitelist;
    this.priceFeedsAddresses = controllerData.priceFeedsAddresses;
    this.curvePresets = controllerData.curvePresets;
    this.storeFrontPriceFactor = controllerData.storeFrontPriceFactor;
  }
}
