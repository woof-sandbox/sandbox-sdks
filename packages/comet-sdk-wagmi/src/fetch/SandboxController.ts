import { type Config, multicall } from "@wagmi/core";
import { SandboxController } from "@woof-software/comet-sdk";
import type { Address } from "viem";
import type { WagmiChainId } from "../config";
import { ControllerContract, wagmiConfig } from "../contracts";
import type {
  ControllerConfiguration,
  ControllerConfigurationResponse,
} from "../contracts/entities";
import { WagmiUtils } from "../utils";
import { SandboxControllerWrapper } from "../wrappers";

function controllerConfigurationToObj(
  data: ControllerConfigurationResponse,
): ControllerConfiguration {
  return {
    targetPercent: data[0],
    storeFrontPriceFactor: data[1],
    minUpdateTime: data[2],
    maxUpdateTime: data[3],
    suggestedLockTimeOfSeedReserves: data[4],
    suggestedAmountOfSeedReserves: data[5],
  };
}

export async function fetchSandboxController(
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
      controller._controllerConfigurationCall(),
    ],
  });

  const daoAddress = WagmiUtils.resultOrThrow<Address>(controllerBaseData[0]);
  const treasuryAddress = WagmiUtils.resultOrThrow<Address>(
    controllerBaseData[1],
  );
  const feeEnabled = WagmiUtils.resultOrThrow<boolean>(controllerBaseData[2]);
  const controllerConfigList =
    WagmiUtils.resultOrThrow<ControllerConfigurationResponse>(
      controllerBaseData[3],
    );
  const controllerConfig = controllerConfigurationToObj(controllerConfigList);

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
  });

  return new SandboxControllerWrapper(sandboxController, chainId, config);
}
