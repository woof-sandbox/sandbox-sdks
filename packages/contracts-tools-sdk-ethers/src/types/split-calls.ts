import type { ContractCall } from "./contract";
import type { Tagable } from "./multicall";

export interface SplitCalls {
  staticCalls: ContractCall[];
  staticIndexes: number[];
  mutableCalls: ContractCall[];
  mutableTags: Tagable[];
  mutableIndexes: number[];
}
