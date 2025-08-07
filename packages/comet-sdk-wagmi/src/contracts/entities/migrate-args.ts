import type { Address } from "viem";
import type { MultiAllowanceCallType } from "./multi-allowance-call";

export type MigrateArgs = {
  fromCometAddress: Address;
  toCometAddress: Address;
  flashAmount: bigint;
  collateralsData?: MultiAllowanceCallType[];
  value?: bigint;
};
