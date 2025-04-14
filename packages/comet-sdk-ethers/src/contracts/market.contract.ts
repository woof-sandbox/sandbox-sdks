import { readContract } from "@wagmi/core";
import type { Address } from "viem";
import { cometAbi } from "../abis";
import { config } from "./bulker.contract";

export class MarketContract {
  async getIsAllow(cometAddress: Address, owner: Address, bulker: Address) {
    return await readContract(config, {
      abi: cometAbi,
      address: cometAddress,
      functionName: "isAllowed",
      args: [owner, bulker],
    });
  }
}
