import type { Interface } from "ethers";
import type { StateMutability } from "../state-mutabiity";

export type ContractCall = {
  method: string;
  target: string;
  allowFailure: boolean;
  callData: string;
  stateMutability: StateMutability;
  contractInterface: Interface;
};
