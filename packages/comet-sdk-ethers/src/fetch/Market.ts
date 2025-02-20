import { Market } from "@sandbox/comet-sdk";
import type { JsonRpcProvider } from "ethers";
import { CometContract, MulticallContract } from "../contracts";

export async function fetchMarket(
  cometProxyAddress: string,
  provider: JsonRpcProvider,
): Promise<Market> {
  const comet = new CometContract(cometProxyAddress, provider);
  const multicall = new MulticallContract(provider);

  const utilization = await comet.getUtilization();

  const borrowRateCall = comet.getBorrowRateCall(utilization!);
  const supplyRateCall = comet.getSupplyRateCall(utilization!);

  const borrowRateTag = "borrowRate";
  multicall.add(borrowRateTag, borrowRateCall);

  const supplyRateTag = "supplyRate";
  multicall.add(supplyRateTag, supplyRateCall);

  const success: boolean = await multicall.run();

  let borrowRate;
  let supplyRate;

  if (success) {
    borrowRate = multicall.getSingle<bigint>(
      borrowRateTag,
      borrowRateCall.method,
      comet.interface,
    );
    supplyRate = multicall.getSingle<bigint>(
      supplyRateTag,
      supplyRateCall.method,
      comet.interface,
    );
  }

  const data = {
    cometAddress: cometProxyAddress,
    utilization,
    borrowRate,
    supplyRate,
  };

  return new Market(data);
}
