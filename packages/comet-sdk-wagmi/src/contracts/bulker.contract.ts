import type { Config, WriteContractReturnType } from "@wagmi/core";
import type { Address } from "viem";
import { bulkerAbi } from "../abis";
import type { WagmiChainId } from "../config";
import { WagmiContract } from "./wagmi-contract";
import { wagmiConfig } from "./wagmiConfig";

export class BulkerContract extends WagmiContract {
  constructor(
    address: Address,
    chainId?: WagmiChainId,
    config: Config = wagmiConfig,
  ) {
    super(config, bulkerAbi, address, chainId);
  }

  async invoke(args: any[], value?: bigint): Promise<WriteContractReturnType> {
    return this.write("invoke", this.chainId, args, value);
  }
}
