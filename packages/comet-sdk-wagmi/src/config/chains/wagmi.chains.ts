import { arbitrum, mainnet, sepolia } from "@wagmi/core/chains";

export const WagmiChains = [mainnet, sepolia, arbitrum] as const;
export const WagmiChainIds = [mainnet.id, sepolia.id, arbitrum.id] as const;

export type WagmiChainId = 1 | 42161 | 111555111;
// export type WagmiChainId = (typeof WagmiChainIds)[number];
