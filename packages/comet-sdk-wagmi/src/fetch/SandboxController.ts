import { SandboxController } from "@woof-software/comet-sdk";
import { type Config, multicall } from "@wagmi/core";
import type { WagmiChainId } from "../config";
import { ControllerContract, wagmiConfig } from "../contracts";
import { WagmiUtils } from "../utils";
import { SandboxControllerWrapper } from "../wrappers";

export async function fetchSandboxControllerData(
  controllerAddress: `0x${string}`,
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

  const daoAddress = WagmiUtils.resultOrThrow<`0x${string}`>(
    controllerBaseData[0],
  );
  const treasuryAddress = WagmiUtils.resultOrThrow<`0x${string}`>(
    controllerBaseData[1],
  );
  const feeEnabled = WagmiUtils.resultOrThrow<boolean>(controllerBaseData[2]);
  const controllerConfigRaw = WagmiUtils.resultOrThrow<any>(
    controllerBaseData[3],
  );

  const configuration = {
    storeFrontPriceFactor: controllerConfigRaw[0],
    minUpdateTime: controllerConfigRaw[1],
    suggestedAmountOfSeedReserves: controllerConfigRaw[2],
    suggestedLockTimeOfSeedReserves: controllerConfigRaw[3],
  };

  const sandboxController = new SandboxController({
    address: controllerAddress,
    daoAddress,
    multisigAddress: treasuryAddress,
    suggestedAmountOfSeedReserves: configuration.suggestedAmountOfSeedReserves,
    suggestedLockTimeOfSeedReserves:
      configuration.suggestedLockTimeOfSeedReserves,
    minUpdateTime: configuration.minUpdateTime,
    feeEnabled,
    treasuryAddress,
    storeFrontPriceFactor: Number(configuration.storeFrontPriceFactor),
    baseWhitelist: [], // TODO
    collateralsWhitelist: [], // TODO
  });

  return new SandboxControllerWrapper(sandboxController, chainId, config);
}
