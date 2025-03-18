import type { Base, Collateral } from "../token";

export interface ISandboxController {
  address: string;
  baseWhitelist: Base[];
  collateralsWhitelist: Collateral[];
  priceFeedsAddresses: string[]; // ?
  storeFrontPriceFactor: number; // percents
}
