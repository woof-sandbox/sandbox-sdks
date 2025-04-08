import type { ContractCall } from "./contract";

export interface SplitCalls {
  staticCalls: ContractCall[];
  staticIndexes: number[];
  mutableCalls: ContractCall[];
  mutableIndexes: number[];
}
