import { StateMutability } from "../entities";

export const isStaticMethod = (state: StateMutability | string): boolean => {
  // Checks if view
  return state === StateMutability.View || state === StateMutability.Pure;
};
