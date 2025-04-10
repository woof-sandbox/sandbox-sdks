import type { ContractCall } from "../contract";

export interface MulticallDecodableData {
  call: ContractCall;
  rawData: string;
}
