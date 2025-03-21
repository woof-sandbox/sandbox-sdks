import { Market } from "@sandbox/comet-sdk";
import type { Provider, Signer } from "ethers";
import { CometContract, MulticallContract } from "../contracts";

export async function fetchMarket(
  cometProxyAddress: string,
  driver: Provider | Signer,
): Promise<Market> {
  const comet = new CometContract(cometProxyAddress, driver);
  const multicall = new MulticallContract(driver);

  const utilization = await comet.getUtilization();

  const borrowRateTag = "borrowRate";
  multicall.add(borrowRateTag, comet.getBorrowRateCall(utilization));

  const supplyRateTag = "supplyRate";
  multicall.add(supplyRateTag, comet.getSupplyRateCall(utilization));

  multicall.add(supplyRateTag, comet.getSupplyRateCall(utilization));

  const success: boolean = await multicall.run();

  let borrowRate: bigint | undefined;
  let supplyRate: bigint | undefined;
  if (success) {
    borrowRate = multicall.getSingle<bigint>(borrowRateTag);
    supplyRate = multicall.getSingle<bigint>(supplyRateTag);
  }

  const data = {
    cometAddress: cometProxyAddress,
    utilization,
    borrowRate,
    supplyRate,
    // TODO
  };

  return new Market(data);
}
