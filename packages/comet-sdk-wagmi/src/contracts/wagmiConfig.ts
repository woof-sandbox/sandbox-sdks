import {createConfig, http} from "@wagmi/core";
import {mainnet, sepolia, arbitrum} from "@wagmi/core/chains";
import {WagmiChains} from "../config/chains";

export const WagmiConfig = createConfig({
    chains: WagmiChains,
    transports: {
        [mainnet.id]: http(),
        [arbitrum.id]: http(),
        [sepolia.id]: http(),
    },
});
