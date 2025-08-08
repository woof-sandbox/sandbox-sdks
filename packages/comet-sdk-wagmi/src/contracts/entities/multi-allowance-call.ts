import type { Address } from "viem";

export type MultiAllowanceCallType = {
  tokenAddress: Address;
  inputAmount: string;
  isNative?: boolean;
};

export type MultiAllowanceCallTypeBigInt = {
  tokenAddress: Address;
  inputAmount: bigint;
};

export type MultiMigrateCollaterals = {
  asset: Address;
  amount: bigint;
};
