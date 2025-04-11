import type { ContractCall } from "../types";

export const isParsable = (call: ContractCall): boolean =>
  call.method !== undefined && call.contractInterface !== undefined;
