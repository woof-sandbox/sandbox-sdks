import type { Address } from "viem";

export type MultiAllowanceResponseType = {
  tokenAddress: Address;
  inputAmount: string;
  allowance?: bigint;
  isNative?: boolean;
};
