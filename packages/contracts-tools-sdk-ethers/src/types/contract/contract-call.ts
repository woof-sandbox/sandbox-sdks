import { Interface } from 'ethers';
import { StateMutability } from '../state-mutabiity';

export type ContractCall = {
  method: string;
  target: string;
  allowFailure: boolean;
  callData: string;
  stateMutability: StateMutability;
  contractInterface: Interface;
};
