import type { Config } from "@wagmi/core";
import type { Address, ContractFunctionParameters } from "viem";
import { chainlinkPriceFeedAbi } from "../abis";
import type { WagmiChainId } from "../config";
import { WagmiContract } from "./wagmi-contract";
import { wagmiConfig } from "./wagmiConfig";

export class ChainlinkPriceFeedContract extends WagmiContract {
  constructor(
    address: Address,
    chainId?: WagmiChainId,
    config: Config = wagmiConfig,
  ) {
    super(config, chainlinkPriceFeedAbi, address, chainId);
  }

  getDecimalsCall(): ContractFunctionParameters {
    return this.getCall("decimals");
  }
}
