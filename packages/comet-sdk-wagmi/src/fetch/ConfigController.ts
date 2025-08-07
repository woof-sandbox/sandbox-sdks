import { type Config, multicall } from "@wagmi/core";
import { ConfigController } from "@woof-software/comet-sdk";
import type { Address } from "viem";
import type { WagmiChainId } from "../config";
import { wagmiConfig } from "../contracts";
import { ConfigControllerContract } from "../contracts";
import { WagmiUtils } from "../utils";
import { ConfigControllerWrapper } from "../wrappers";

export async function fetchConfigControllerData(
  controllerAddress: Address,
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

  const owner = WagmiUtils.resultOrThrow<Address>(baseData[0]);
  const guardian = WagmiUtils.resultOrThrow<Address>(baseData[1]);
  const curator = WagmiUtils.resultOrThrow<Address>(baseData[2]);
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
