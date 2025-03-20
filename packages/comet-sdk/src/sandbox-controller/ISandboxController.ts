import type { IBase, ICollateral } from "../token";

export interface ISandboxController {
  address: string;
  baseWhitelist: IBase[];
  collateralsWhitelist: ICollateral[];
  storeFrontPriceFactor: number; // percents
}
