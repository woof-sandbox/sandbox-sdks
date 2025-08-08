import type { Address } from "viem";
import {
  MultiAllowanceCallType,
  MultiMigrateCollaterals,
} from "./multi-allowance-call";

export type MigrateArgs = {
  fromCometAddress: Address;
  toCometAddress: Address;
  flashAmount: bigint;
  collateralsData?: MultiMigrateCollaterals[];
  value?: bigint;
};
