import {Abi, ContractFunctionParameters} from "viem";
import {Config, readContract, writeContract, WriteContractReturnType} from '@wagmi/core';

export class WagmiContract {
  constructor(
      protected readonly config: Config,
    public readonly abi: Abi,
    public readonly address: `0x${string}`,
  ) {}

  /**
  * For Multicall purpose
  * */
  getCall(functionName: string, args?: any[]): ContractFunctionParameters {
    return {
      address: this.address,
      abi: this.abi,
      functionName,
      args,
    } as const;
  }
  //
  read(functionName: string, args?: any[]): Promise<unknown> {
    return readContract(
        this.config,
        {
      address: this.address,
      abi: this.abi,
      functionName,
      args,
    });
  }
  write(functionName: string, args?: any[]): Promise<WriteContractReturnType> {
    return writeContract(
        this.config,
        {
          address: this.address,
          abi: this.abi,
          functionName,
          args,
        });
  }
}
