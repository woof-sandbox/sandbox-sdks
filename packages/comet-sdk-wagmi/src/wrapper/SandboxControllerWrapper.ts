import { SandboxController } from "@sandbox/comet-sdk";
import type { ISandboxController } from "@sandbox/comet-sdk/src/sandbox-controller";
import type { Config, WriteContractReturnType } from "@wagmi/core";
import type { WagmiChainId } from "../config/chains";
import { ControllerContract, wagmiConfig } from "../contracts";

export class SandboxControllerWrapper extends SandboxController {
  private readonly controllerContract: ControllerContract;
  public chainId: WagmiChainId;
  private config: Config;

  constructor(
    sandboxController: ISandboxController,
    chainId: WagmiChainId,
    config: Config = wagmiConfig,
  ) {
    super(sandboxController);
    this.controllerContract = new ControllerContract(
      this.address,
      chainId,
      config,
    );
    this.chainId = chainId;
    this.config = config;
  }

  async addBaseAssetCurve(
    token: `0x${string}`,
    baseAssetCurve: {
      supplyKink: bigint;
      supplyPerYearInterestRateBase: bigint;
      supplyPerYearInterestRateSlopeLow: bigint;
      supplyPerYearInterestRateSlopeHigh: bigint;
      borrowKink: bigint;
      borrowPerYearInterestRateBase: bigint;
      borrowPerYearInterestRateSlopeLow: bigint;
      borrowPerYearInterestRateSlopeHigh: bigint;
    },
  ): Promise<WriteContractReturnType> {
    try {
      return await this.controllerContract.addBaseAssetCurve(
        token,
        baseAssetCurve,
        this.chainId,
      );
    } catch {
      throw new Error("Failed to add base asset curve.");
    }
  }

  async changeBaseAssetCurve(
    token: `0x${string}`,
    curveIndex: bigint,
    newCurve: {
      supplyKink: bigint;
      supplyPerYearInterestRateBase: bigint;
      supplyPerYearInterestRateSlopeLow: bigint;
      supplyPerYearInterestRateSlopeHigh: bigint;
      borrowKink: bigint;
      borrowPerYearInterestRateBase: bigint;
      borrowPerYearInterestRateSlopeLow: bigint;
      borrowPerYearInterestRateSlopeHigh: bigint;
    },
  ): Promise<WriteContractReturnType> {
    try {
      return await this.controllerContract.changeBaseAssetCurve(
        token,
        curveIndex,
        newCurve,
        this.chainId,
      );
    } catch {
      throw new Error("Failed to change base asset curve.");
    }
  }

  async setConfiguration(config: {
    storeFrontPriceFactor: bigint;
    minUpdateTime: bigint;
    suggestedAmountOfSeedReserves: bigint;
    suggestedLockTimeOfSeedReserves: bigint;
  }): Promise<WriteContractReturnType> {
    try {
      return await this.controllerContract.setConfiguration(
        config,
        this.chainId,
      );
    } catch {
      throw new Error("Failed to set configuration.");
    }
  }

  async setFeeEnabled(feeEnabled: boolean): Promise<WriteContractReturnType> {
    try {
      return await this.controllerContract.setFeeEnabled(
        feeEnabled,
        this.chainId,
      );
    } catch {
      throw new Error("Failed to set fee status.");
    }
  }

  async transferDao(newDao: `0x${string}`): Promise<WriteContractReturnType> {
    try {
      return await this.controllerContract.transferDao(newDao, this.chainId);
    } catch {
      throw new Error("Failed to transfer DAO ownership.");
    }
  }

  async transferOwner(
    newOwner: `0x${string}`,
  ): Promise<WriteContractReturnType> {
    try {
      return await this.controllerContract.transferOwner(
        newOwner,
        this.chainId,
      );
    } catch {
      throw new Error("Failed to transfer owner.");
    }
  }

  async setTreasury(treasury: `0x${string}`): Promise<WriteContractReturnType> {
    try {
      return await this.controllerContract.setTreasury(treasury, this.chainId);
    } catch {
      throw new Error("Failed to set treasury address.");
    }
  }

  async setThresholds(
    thresholds: [bigint, bigint, bigint],
  ): Promise<WriteContractReturnType> {
    try {
      return await this.controllerContract.setThresholds(
        thresholds,
        this.chainId,
      );
    } catch {
      throw new Error("Failed to set thresholds.");
    }
  }

  async whitelistBaseAsset(
    token: `0x${string}`,
    priceFeed: `0x${string}`,
    baseAssetCurve: {
      supplyKink: bigint;
      supplyPerYearInterestRateBase: bigint;
      supplyPerYearInterestRateSlopeLow: bigint;
      supplyPerYearInterestRateSlopeHigh: bigint;
      borrowKink: bigint;
      borrowPerYearInterestRateBase: bigint;
      borrowPerYearInterestRateSlopeLow: bigint;
      borrowPerYearInterestRateSlopeHigh: bigint;
    },
    minBorrow: bigint,
  ): Promise<WriteContractReturnType> {
    try {
      return await this.controllerContract.whitelistBaseAsset(
        token,
        priceFeed,
        baseAssetCurve,
        minBorrow,
        this.chainId,
      );
    } catch {
      throw new Error("Failed to whitelist base asset.");
    }
  }
}
