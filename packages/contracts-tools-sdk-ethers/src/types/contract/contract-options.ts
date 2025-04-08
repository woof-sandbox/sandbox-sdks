import type { CallMutability } from "../call-mutability";
import type { PriorityCallOptions } from "../priority-call-options";

export interface ContractOptions {
  forceMutability?: CallMutability;
  highPriorityTxs?: boolean;
  priorityOptions?: PriorityCallOptions;
  logsBlocksStep?: number;
  logsDelayMs?: number;
  signals?: AbortSignal[];
  staticCallsTimeoutMs?: number;
  mutableCallsTimeoutMs?: number;
}
