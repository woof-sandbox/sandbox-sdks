import { StateMutability } from "../types";

export const isStaticMethod = (state: StateMutability | string): boolean => {
  return state === StateMutability.View || state === StateMutability.Pure;
};
