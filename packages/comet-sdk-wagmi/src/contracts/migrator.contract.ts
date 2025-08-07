import type { Config, WriteContractReturnType } from "@wagmi/core";
import type { Address } from "viem";
import { migratorAbi } from "../abis";
import type { WagmiChainId } from "../config";
import type { MigrateArgs } from "./entities/migrate-args";
import { WagmiContract } from "./wagmi-contract";
import { wagmiConfig } from "./wagmiConfig";

export class MigratorContract extends WagmiContract {
  constructor(
    address: Address,
    chainId?: WagmiChainId,
    config: Config = wagmiConfig,
  ) {
    super(config, migratorAbi, address, chainId);
  }

  async fullMigrate(args: MigrateArgs): Promise<WriteContractReturnType> {
    return this.write(
      "fullMigrate",
      this.chainId,
      [args.fromCometAddress, args.toCometAddress, args.flashAmount],
      args.value,
    );
  }

  async partialMigrate(args: MigrateArgs): Promise<WriteContractReturnType> {
    return this.write(
      "partialMigrate",
      this.chainId,
      [
        args.fromCometAddress,
        args.toCometAddress,
        args.collateralsData,
        args.flashAmount,
      ],
      args.value,
    );
  }
}
