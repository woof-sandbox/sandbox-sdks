/* TODO: remove
import {Config, readContract} from "@wagmi/core";
import type { Address } from "viem";
import { cometAbi } from "../abis";
import { config } from "./bulker.contract";
import {WagmiContract} from "./wagmi-contract";

export class MarketContract extends WagmiContract {
  constructor(
      config: Config,
      address: `0x${string}`
  ) {
    super(config, cometAbi, address);
  }

  async getIsAllow(cometAddress: Address, owner: Address, bulker: Address) {
    return await readContract(config, {
      abi: cometAbi,
      address: cometAddress,
      functionName: "isAllowed",
      args: [owner, bulker],
    });
  }
}
*/
