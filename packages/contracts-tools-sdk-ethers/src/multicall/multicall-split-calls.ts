import { isStaticMethod } from "../helpers";
import type { ContractCall, SplitCalls, Tagable } from "../types";

export const multicallSplitCalls = (
  calls: ContractCall[],
  tags: Tagable[],
): SplitCalls =>
  calls.reduce<SplitCalls>(
    (acc, call, index) => {
      if (isStaticMethod(call.stateMutability)) {
        acc.staticCalls.push(call);
        acc.staticIndexes.push(index);
      } else {
        acc.mutableCalls.push(call);
        acc.mutableTags.push(tags[index]!);
        acc.mutableIndexes.push(index);
      }
      return acc;
    },
    {
      staticCalls: [],
      staticIndexes: [],
      mutableCalls: [],
      mutableTags: [],
      mutableIndexes: [],
    },
  );
