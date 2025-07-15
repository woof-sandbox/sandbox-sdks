import type { Address } from "viem";

export type MultiAllowanceCallType = {
  tokenAddress: Address;
  inputAmount: string;
  isNative?: boolean;
};
