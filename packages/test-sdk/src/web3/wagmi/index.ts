import { arbitrum } from "@wagmi/core/chains";
import { http, createConfig } from "wagmi";

export const config = createConfig({
  chains: [arbitrum],
  transports: {
    [arbitrum.id]: http(),
  },
});
