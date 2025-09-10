import { type Config, multicall } from "@wagmi/core";
import { SandboxController } from "@woof-software/comet-sdk";
import type { Address } from "viem";
import type { WagmiChainId } from "../config";
import { ControllerContract, wagmiConfig } from "../contracts";
import type { ControllerConfiguration } from "../contracts/entities/controller-configuration";
import { WagmiUtils } from "../utils";
import { SandboxControllerWrapper } from "../wrappers";

export async function fetchSandboxControllerData(
  controllerAddress: Address,
  chainId: WagmiChainId,
  config: Config = wagmiConfig,
): Promise<SandboxControllerWrapper> {
  const controller = new ControllerContract(controllerAddress, chainId);

  const controllerBaseData = await multicall(config, {
    chainId,
    contracts: [
      controller.daoCall(),
      controller.treasuryCall(),
      controller.feeEnabledCall(),
      controller.controllerConfigurationCall(),
    ],
  });

  const daoAddress = WagmiUtils.resultOrThrow<Address>(controllerBaseData[0]);
  const treasuryAddress = WagmiUtils.resultOrThrow<Address>(
    controllerBaseData[1],
  );
  const feeEnabled = WagmiUtils.resultOrThrow<boolean>(controllerBaseData[2]);
  const controllerConfig = WagmiUtils.resultOrThrow<ControllerConfiguration>(
    controllerBaseData[3],
  );

  const sandboxController = new SandboxController({
    address: controllerAddress,
    daoAddress,
    multisigAddress: treasuryAddress,
    suggestedAmountOfSeedReserves:
      controllerConfig.suggestedAmountOfSeedReserves,
    suggestedLockTimeOfSeedReserves:
      controllerConfig.suggestedLockTimeOfSeedReserves,
    minUpdateTime: controllerConfig.minUpdateTime,
    feeEnabled,
    treasuryAddress,
    storeFrontPriceFactor: Number(controllerConfig.storeFrontPriceFactor),
    baseWhitelist: [], // TODO
    collateralsWhitelist: [], // TODO
  });

  return new SandboxControllerWrapper(sandboxController, chainId, config);
}
