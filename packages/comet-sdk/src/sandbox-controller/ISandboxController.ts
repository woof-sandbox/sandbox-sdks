import type { Curve } from "../curve";
import type { Base, Collateral } from "../token";

export interface ISandboxController {
  address: string;
  baseWhitelist: Base[];
  collateralsWhitelist: Collateral[];
  priceFeedsAddresses: string[]; // ?
  curvePresets: Curve[];
  storeFrontPriceFactor: number; // percents
}
