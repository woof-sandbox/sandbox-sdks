import type { CallMutability } from "../call-mutability";
import type { PriorityCallOptions } from "../priority-call-options";

export interface MulticallOptions {
  forceMutability?: CallMutability;
  waitForTxs?: boolean;
  highPriorityTxs?: boolean;
  priorityOptions?: PriorityCallOptions;
  maxStaticCallsStack?: number;
  maxMutableCallsStack?: number;
  signals?: AbortSignal[];
  staticCallsTimeoutMs?: number;
  mutableCallsTimeoutMs?: number;
  waitCallsTimeoutMs?: number;
  batchDelayMs?: number;
}
