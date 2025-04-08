import type { CallMutability } from "../call-mutability";
import type { PriorityCallOptions } from "../priority-call-options";

export interface ContractCallOptions {
  forceMutability?: CallMutability;
  highPriorityTx?: boolean;
  priorityOptions?: PriorityCallOptions;
  signals?: AbortSignal[];
  timeoutMs?: number;
}
