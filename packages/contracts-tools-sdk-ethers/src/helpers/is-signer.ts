import type { Provider, Signer } from "ethers";

export const isSigner = (driver: Signer | Provider) => {
  // @ts-ignore
  return typeof (driver as unknown).getAddress === "function";
};
