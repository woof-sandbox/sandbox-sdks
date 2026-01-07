import { http, createConfig } from "@wagmi/core";
import { arbitrum, mainnet, sepolia } from "@wagmi/core/chains";
import { WagmiChains } from "../config";

export const wagmiConfig = createConfig({
  chains: WagmiChains,
  transports: {
    [mainnet.id]: http("https://rpc.ankr.com/eth/e1d0a2568ebc983c815a7a7190b3d2bb39d859b8186ae0dd32a4354f71601591"),
    [arbitrum.id]: http("https://rpc.ankr.com/arbitrum/e1d0a2568ebc983c815a7a7190b3d2bb39d859b8186ae0dd32a4354f71601591"),
    [sepolia.id]: http("https://rpc.ankr.com/eth_sepolia/e1d0a2568ebc983c815a7a7190b3d2bb39d859b8186ae0dd32a4354f71601591"),
  },
});
