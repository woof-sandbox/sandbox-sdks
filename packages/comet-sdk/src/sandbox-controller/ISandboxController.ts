import type { IBase, ICollateral } from "../token";

export interface ISandboxController {
  address: string;

  daoAddress: string; // contract
  multisigAddress: string; // contract
  suggestedAmountOfSeedReserves: bigint;
  suggestedLockTimeOfSeedReserves: bigint;
  minUpdateTime: bigint;
  feeEnabled: boolean; // is commission gathering from the whole protocol enabled
  treasuryAddress: string; // (still not available - mock with r address)

  baseWhitelist: IBase[];
  collateralsWhitelist: ICollateral[];
  storeFrontPriceFactor: number; // percents (1e18 == 100%)
}
