import type { Address } from "viem";
import type { IBase, ICollateral } from "../token";
import type { ISandboxController } from "./ISandboxController";

export class SandboxController implements ISandboxController {
  address: Address;

  daoAddress: Address; // contract
  multisigAddress: Address; // contract
  suggestedAmountOfSeedReserves: bigint;
  suggestedLockTimeOfSeedReserves: bigint;
  minUpdateTime: bigint;
  feeEnabled: boolean; // is commission gathering from the whole protocol enabled
  treasuryAddress: string; // (still not available - mock with r address)

  baseWhitelist: IBase[];
  collateralsWhitelist: ICollateral[];
  storeFrontPriceFactor: number; // percents (1e18 == 100%)

  constructor(controllerData: ISandboxController) {
    this.address = controllerData.address;

    this.daoAddress = controllerData.daoAddress;
    this.multisigAddress = controllerData.multisigAddress;
    this.suggestedAmountOfSeedReserves =
      controllerData.suggestedAmountOfSeedReserves;
    this.suggestedLockTimeOfSeedReserves =
      controllerData.suggestedLockTimeOfSeedReserves;
    this.minUpdateTime = controllerData.minUpdateTime;
    this.feeEnabled = controllerData.feeEnabled;
    this.treasuryAddress = controllerData.treasuryAddress;

    this.baseWhitelist = controllerData.baseWhitelist;
    this.collateralsWhitelist = controllerData.collateralsWhitelist;
    this.storeFrontPriceFactor = controllerData.storeFrontPriceFactor;
  }
}
