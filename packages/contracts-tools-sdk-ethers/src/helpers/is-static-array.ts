import type { ContractCall } from "../types";
import { isStaticMethod } from "./is-static-method";

export const isStaticArray = (calls: ContractCall[]): boolean =>
  !calls.some((call) => !isStaticMethod(call.stateMutability));
