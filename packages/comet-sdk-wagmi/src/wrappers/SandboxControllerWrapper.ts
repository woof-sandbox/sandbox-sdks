import type { Config, WriteContractReturnType } from "@wagmi/core";
import { type ICurve, SandboxController } from "@woof-software/comet-sdk";
import type { ISandboxController } from "@woof-software/comet-sdk/src/sandbox-controller";
import type { Address } from "viem";
import type { WagmiChainId } from "../config";
import { ControllerContract, wagmiConfig } from "../contracts";
import {
  CHANGE_CURVE_FAILED,
  SET_CONFIG_FAILED,
  SET_FEE_FAILED,
  SET_TREASURY_FAILED,
  TRANSFER_DAO_FAILED,
  TRANSFER_OWNER_FAILED,
  WHITELIST_BASE_ASSET_FAILED,
} from "../errors/wrappers/sandbox-controller-wrapper.errors";

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

  async changeBaseAssetCurve(
    token: Address,
    curveIndex: bigint,
    newCurve: ICurve,
  ): Promise<WriteContractReturnType> {
    try {
      return await this.controllerContract.changeBaseAssetCurve(
        token,
        curveIndex,
        newCurve,
        this.chainId,
      );
    } catch {
      throw CHANGE_CURVE_FAILED();
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
      throw SET_CONFIG_FAILED();
    }
  }

  async setFeeEnabled(feeEnabled: boolean): Promise<WriteContractReturnType> {
    try {
      return await this.controllerContract.setFeeEnabled(
        feeEnabled,
        this.chainId,
      );
    } catch {
      throw SET_FEE_FAILED();
    }
  }

  async transferDao(newDao: Address): Promise<WriteContractReturnType> {
    try {
      return await this.controllerContract.transferDao(newDao, this.chainId);
    } catch {
      throw TRANSFER_DAO_FAILED();
    }
  }

  async transferOwner(newOwner: Address): Promise<WriteContractReturnType> {
    try {
      return await this.controllerContract.transferOwner(
        newOwner,
        this.chainId,
      );
    } catch {
      throw TRANSFER_OWNER_FAILED();
    }
  }

  async setTreasury(treasury: Address): Promise<WriteContractReturnType> {
    try {
      return await this.controllerContract.setTreasury(treasury, this.chainId);
    } catch {
      throw SET_TREASURY_FAILED();
    }
  }

  async whitelistBaseAsset(
    token: Address,
    priceFeed: Address,
    baseAssetCurve: ICurve,
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
      throw WHITELIST_BASE_ASSET_FAILED();
    }
  }
}
