import type { Provider } from "ethers";

export const waitForAddressTxs = async (
  address: string,
  provider: Provider,
  delayMs = 1000,
) => {
  let flag = true;
  while (flag) {
    const pendingNonce = await provider.getTransactionCount(address, "pending");
    const latestNonce = await provider.getTransactionCount(address, "latest");
    flag = pendingNonce > latestNonce;

    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }
};
