import { arbitrum, sepolia } from "@wagmi/core/chains";
import { http, createConfig } from "wagmi";

export const config = createConfig({
  chains: [arbitrum, sepolia],
  transports: {
    [arbitrum.id]: http(),
    [sepolia.id]: http(),
  },
});
