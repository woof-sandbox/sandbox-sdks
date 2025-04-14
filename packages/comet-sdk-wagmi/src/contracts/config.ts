import {createConfig, http} from "@wagmi/core";
import {arbitrum, mainnet, sepolia} from "@wagmi/core/chains";

export const config = createConfig({
    chains: [mainnet, sepolia, arbitrum],
    transports: {
        [mainnet.id]: http(),
        [arbitrum.id]: http(),
        [sepolia.id]: http(),
    },
});
