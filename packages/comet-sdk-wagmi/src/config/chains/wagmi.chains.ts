import { arbitrum, mainnet, sepolia } from "@wagmi/core/chains";

export const fakeSepolia = {
  ...sepolia,
  id: 111555111 as const,
}

export const WagmiChains = [mainnet, fakeSepolia, arbitrum] as const;
export const WagmiChainIds = [mainnet.id, fakeSepolia.id, arbitrum.id] as const;

export type WagmiChainId = (typeof WagmiChainIds)[number];
