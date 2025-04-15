import {
  type Config,
  type WriteContractReturnType,
  readContract,
  writeContract,
} from "@wagmi/core";
import type { Abi, ContractFunctionParameters } from "viem";
import type { WagmiChainId } from "../config/chains";

export class WagmiContract {
  constructor(
    protected readonly config: Config,
    public readonly abi: Abi,
    public readonly address: `0x${string}`,
    public readonly chainId?: WagmiChainId,
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
  read(
    functionName: string,
    chainId?: WagmiChainId,
    args?: any[],
  ): Promise<unknown> {
    return readContract(this.config, {
      address: this.address,
      abi: this.abi,
      functionName,
      args,
      chainId: chainId ?? this.chainId,
    });
  }
  write(
    functionName: string,
    chainId?: WagmiChainId,
    args?: any[],
  ): Promise<WriteContractReturnType> {
    return writeContract(this.config, {
      address: this.address,
      abi: this.abi,
      functionName,
      args,
      chainId: chainId ?? this.chainId,
    });
  }
}
