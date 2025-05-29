import type { Config } from "@wagmi/core";
import { migratorAbi } from "../abis";
import type { WagmiChainId } from "../config";
import { WagmiContract } from "./wagmi-contract";
import { wagmiConfig } from "./wagmiConfig";
import { Address } from "viem";

export class MigratorContract extends WagmiContract {
  constructor(
    address: Address,
    chainId?: WagmiChainId,
    config: Config = wagmiConfig,
  ) {
    super(config, migratorAbi, address, chainId);
  }

  async fullMigrate(args: any[], value?: bigint) {
    return this.write("fullMigrate", this.chainId, args, value);
  }

  async partialMigrate(args: any[], value?: bigint) {
    return this.write("partialMigrate", this.chainId, args, value);
  }
}
