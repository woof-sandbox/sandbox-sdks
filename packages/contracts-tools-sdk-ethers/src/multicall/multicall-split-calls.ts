import { isStaticMethod } from '../helpers';
import { ContractCall, SplitCalls } from '../types';

export const multicallSplitCalls = (calls: ContractCall[]): SplitCalls =>
  calls.reduce<SplitCalls>(
    (acc, call, index) => {
      if (isStaticMethod(call.stateMutability)) {
        acc.staticCalls.push(call);
        acc.staticIndexes.push(index);
      } else {
        acc.mutableCalls.push(call);
        acc.mutableIndexes.push(index);
      }
      return acc;
    },
    {
      staticCalls: [],
      staticIndexes: [],
      mutableCalls: [],
      mutableIndexes: [],
    },
  );
