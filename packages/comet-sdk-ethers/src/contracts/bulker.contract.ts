import { http, createConfig, getWalletClient } from "@wagmi/core";
import { arbitrum, mainnet, sepolia } from "@wagmi/core/chains";
import type { Address } from "viem";
import { BulkerAbi } from "../abis";

export const config = createConfig({
  chains: [mainnet, sepolia, arbitrum],
  transports: {
    [mainnet.id]: http(),
    [arbitrum.id]: http(),
    [sepolia.id]: http(),
  },
});

export class BulkerContract {
  public bulkerAddress: Address;

  constructor(bulkerAddress: Address) {
    this.bulkerAddress = bulkerAddress;
  }

  async invokeBulker(args: any): Promise<any> {
    const walletClient = await getWalletClient(config);

    return walletClient.writeContract({
      abi: BulkerAbi,
      address: this.bulkerAddress,
      functionName: "invoke",
      args,
    });
  }
}
