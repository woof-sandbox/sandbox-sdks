import { Chain } from "./chains";

export interface IAddresses {
  configurator: `0x${string}`;
  sandboxController: `0x${string}`;
}
// !: change it
export const Addresses: Record<Chain, IAddresses> = {
  [Chain.Arbitrum]: {
    configurator: "0xb21b06D71c75973babdE35b49fFDAc3F82Ad3775",
    sandboxController: "0x316f9708bB98af7dA9c68C1C3b5e79039cD336E3",
  },
  [Chain.Base]: {
    configurator: "0x316f9708bB98af7dA9c68C1C3b5e79039cD336E3",
    sandboxController: "0x316f9708bB98af7dA9c68C1C3b5e79039cD336E3",
  },
  [Chain.Ethereum]: {
    configurator: "0x316f9708bB98af7dA9c68C1C3b5e79039cD336E3",
    sandboxController: "0x316f9708bB98af7dA9c68C1C3b5e79039cD336E3",
  },
  [Chain.Optimism]: {
    configurator: "0x316f9708bB98af7dA9c68C1C3b5e79039cD336E3",
    sandboxController: "0x316f9708bB98af7dA9c68C1C3b5e79039cD336E3",
  },
  [Chain.Polygon]: {
    configurator: "0x316f9708bB98af7dA9c68C1C3b5e79039cD336E3",
    sandboxController: "0x316f9708bB98af7dA9c68C1C3b5e79039cD336E3",
  },
  //
  [Chain.Sepolia]: {
    configurator: "0x316f9708bB98af7dA9c68C1C3b5e79039cD336E3",
    sandboxController: "0x316f9708bB98af7dA9c68C1C3b5e79039cD336E3",
  },
  [Chain.Anvil]: {
    configurator: "0x316f9708bB98af7dA9c68C1C3b5e79039cD336E3",
    sandboxController: "0x316f9708bB98af7dA9c68C1C3b5e79039cD336E3",
  },
} as const;
