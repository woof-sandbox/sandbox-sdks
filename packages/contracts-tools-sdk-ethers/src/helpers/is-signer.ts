import type { Provider, Signer } from "ethers";

export const isSigner = (driver: Provider | Signer): driver is Signer => {
  return typeof (driver as Signer)?.getAddress === "function";
};
