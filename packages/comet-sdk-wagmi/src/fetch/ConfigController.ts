import { ConfigController } from "@sandbox/comet-sdk/src/config-controller";
import type { WagmiChainId } from "../config/chains";
import { ConfigControllerContract } from "../contracts/config-controller.contract";
import { wagmiConfig } from "../contracts";
import { multicall } from "@wagmi/core";
import { WagmiUtils } from "../utils";

export async function fetchConfigControllerData(
  controllerAddress: `0x${string}`,
  chainId: WagmiChainId,
): Promise<ConfigController> {
  const controller = new ConfigControllerContract(controllerAddress, chainId);

  const baseData = await multicall(wagmiConfig, {
    chainId,
    contracts: [
      controller.getOwnerCall(),
      controller.getGuardianCall(),
      controller.getCuratorCall(),
      controller.getCuratorFeeCall(),
      controller.getMarketsLengthCall(),
      controller.getRevenueTokensLengthCall(),
    ],
  });

  const owner = WagmiUtils.resultOrThrow<`0x${string}`>(baseData[0]);
  const guardian = WagmiUtils.resultOrThrow<`0x${string}`>(baseData[1]);
  const curator = WagmiUtils.resultOrThrow<`0x${string}`>(baseData[2]);
  const curatorFee = WagmiUtils.resultOrThrow<bigint>(baseData[3]);
  const marketsLength = WagmiUtils.resultOrThrow<bigint>(baseData[4]);
  const revenueTokensLength = WagmiUtils.resultOrThrow<bigint>(baseData[5]);

  return new ConfigController({
    address: controllerAddress,
    owner,
    guardian,
    curator,
    curatorFee: Number(curatorFee),
    marketsLength: Number(marketsLength),
    revenueTokensLength: Number(revenueTokensLength),
  });
}
