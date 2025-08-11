import type { Address } from "viem";
import type { MultiMigrateCollaterals } from "./multi-allowance-call";

export type MigrateArgs = {
  fromCometAddress: Address;
  toCometAddress: Address;
  flashAmount: bigint;
  collateralsData?: MultiMigrateCollaterals[];
  value?: bigint;
};
