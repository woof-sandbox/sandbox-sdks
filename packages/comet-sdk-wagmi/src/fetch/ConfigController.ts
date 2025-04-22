import { ConfigController } from "@sandbox/comet-sdk";
import { type Config, multicall } from "@wagmi/core";
import type { WagmiChainId } from "../config/chains";
import { wagmiConfig } from "../contracts";
import { ConfigControllerContract } from "../contracts/config-controller.contract";
import { WagmiUtils } from "../utils";
import { ConfigControllerWrapper } from "../wrappers/ConfigControllerWrapper";

export async function fetchConfigControllerData(
  controllerAddress: `0x${string}`,
  chainId: WagmiChainId,
  config: Config,
): Promise<ConfigControllerWrapper> {
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

  const configController = new ConfigController({
    address: controllerAddress,
    owner,
    guardian,
    curator,
    curatorFee: Number(curatorFee),
    marketsLength: Number(marketsLength),
    revenueTokensLength: Number(revenueTokensLength),
  });

  return new ConfigControllerWrapper(configController, chainId, config);
}
