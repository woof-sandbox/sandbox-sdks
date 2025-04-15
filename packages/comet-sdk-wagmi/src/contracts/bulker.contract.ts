import { getWalletClient } from "@wagmi/core";
import type { Address } from "viem";
import { BulkerAbi } from "../abis";
import { wagmiConfig } from "./wagmiConfig";

export class BulkerContract {
  public bulkerAddress: Address;

  constructor(bulkerAddress: Address) {
    this.bulkerAddress = bulkerAddress;
  }

  async invokeBulker(args: any): Promise<any> {
    const walletClient = await getWalletClient(wagmiConfig);

    return walletClient.writeContract({
      abi: BulkerAbi,
      address: this.bulkerAddress,
      functionName: "invoke",
      args,
    });
  }
}
