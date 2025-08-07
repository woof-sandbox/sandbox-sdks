import { http, createConfig } from "@wagmi/core";
import { arbitrum, mainnet, sepolia } from "@wagmi/core/chains";
import { WagmiChains } from "../config";

export const wagmiConfig = createConfig({
  chains: WagmiChains,
  transports: {
    [mainnet.id]: http(),
    [arbitrum.id]: http(),
    [sepolia.id]: http(),
  },
});
