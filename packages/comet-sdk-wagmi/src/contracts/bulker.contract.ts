import { bulkerAbi } from "../abis";
import type { WagmiChainId } from "../config/chains";
import { WagmiContract } from "./wagmi-contract";
import { wagmiConfig } from "./wagmiConfig";
import { Config } from "@wagmi/core";

export class BulkerContract extends WagmiContract {
  constructor(
    address: `0x${string}`,
    config: Config = wagmiConfig,
    chainId?: WagmiChainId,
  ) {
    super(config, bulkerAbi, address, chainId);
  }

  async invoke(args: any[]) {
    console.log("--args--", args);
    return this.write("invoke", this.chainId, args);
  }
}
