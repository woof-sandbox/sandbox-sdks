import type { Config, WriteContractReturnType } from "@wagmi/core";
import type { Address, ContractFunctionParameters } from "viem";
import { controllerAbi } from "../abis";
import type { WagmiChainId } from "../config";
import type { ControllerConfiguration } from "./entities/controller-configuration";
import { WagmiContract } from "./wagmi-contract";
import { wagmiConfig } from "./wagmiConfig";

export class ControllerContract extends WagmiContract {
  constructor(
    address: Address,
    chainId?: WagmiChainId,
    config: Config = wagmiConfig,
  ) {
    super(config, controllerAbi, address, chainId);
  }

  async _controllerConfiguration(
    chainId?: WagmiChainId,
  ): Promise<ControllerConfiguration> {
    const result = await this.read("_controllerConfiguration", chainId);

    const [
      targetPercent,
      storeFrontPriceFactor,
      minUpdateTime,
      maxUpdateTime,
      suggestedLockTimeOfSeedReserves,
      suggestedAmountOfSeedReserves,
    ] = result as [bigint, bigint, bigint, bigint, bigint, bigint];
    return {
      targetPercent,
      storeFrontPriceFactor,
      minUpdateTime,
      maxUpdateTime,
      suggestedLockTimeOfSeedReserves,
      suggestedAmountOfSeedReserves,
    };
  }

  _controllerConfigurationCall(): ContractFunctionParameters {
    return this.getCall("_controllerConfiguration");
  }

  async baseAssets(token: Address, chainId?: WagmiChainId): Promise<any> {
    const result = await this.read("baseAssets", chainId, [token]);
    return result as any;
  }

  baseAssetsCall(token: Address): ContractFunctionParameters {
    return this.getCall("baseAssets", [token]);
  }

  async collateralAssets(token: Address, chainId?: WagmiChainId): Promise<any> {
    const result = await this.read("collateralAssets", chainId, [token]);
    return result as any;
  }

  collateralAssetsCall(token: Address): ContractFunctionParameters {
    return this.getCall("collateralAssets", [token]);
  }

  async dao(chainId?: WagmiChainId): Promise<Address> {
    const result = await this.read("dao", chainId);
    return result as Address;
  }

  daoCall(): ContractFunctionParameters {
    return this.getCall("dao");
  }

  async feeEnabled(chainId?: WagmiChainId): Promise<boolean> {
    const result = await this.read("feeEnabled", chainId);
    return result as boolean;
  }

  feeEnabledCall(): ContractFunctionParameters {
    return this.getCall("feeEnabled");
  }

  async isBaseTokenWhitelisted(
    token: Address,
    chainId?: WagmiChainId,
  ): Promise<boolean> {
    const result = await this.read("isBaseTokenWhitelisted", chainId, [token]);
    return result as boolean;
  }

  isBaseTokenWhitelistedCall(token: Address): ContractFunctionParameters {
    return this.getCall("isBaseTokenWhitelisted", [token]);
  }

  async isCollateralTokenWhitelisted(
    token: Address,
    chainId?: WagmiChainId,
  ): Promise<boolean> {
    const result = await this.read("isCollateralTokenWhitelisted", chainId, [
      token,
    ]);
    return result as boolean;
  }

  isCollateralTokenWhitelistedCall(token: Address): ContractFunctionParameters {
    return this.getCall("isCollateralTokenWhitelisted", [token]);
  }

  async isCurveConfigurationValid(
    curve: any,
    chainId?: WagmiChainId,
  ): Promise<boolean> {
    const result = await this.read("isCurveConfigurationValid", chainId, [
      curve,
    ]);
    return result as boolean;
  }

  isCurveConfigurationValidCall(curve: any): ContractFunctionParameters {
    return this.getCall("isCurveConfigurationValid", [curve]);
  }

  async owner(chainId?: WagmiChainId): Promise<Address> {
    const result = await this.read("owner", chainId);
    return result as Address;
  }

  ownerCall(): ContractFunctionParameters {
    return this.getCall("owner");
  }

  async protocolCommission(
    arg0: bigint,
    chainId?: WagmiChainId,
  ): Promise<bigint> {
    const result = await this.read("protocolCommission", chainId, [arg0]);
    return result as bigint;
  }

  protocolCommissionCall(arg0: bigint): ContractFunctionParameters {
    return this.getCall("protocolCommission", [arg0]);
  }

  async reserveCommission(
    arg0: bigint,
    chainId?: WagmiChainId,
  ): Promise<bigint> {
    const result = await this.read("reserveCommission", chainId, [arg0]);
    return result as bigint;
  }

  reserveCommissionCall(arg0: bigint): ContractFunctionParameters {
    return this.getCall("reserveCommission", [arg0]);
  }

  async targetReserves(chainId?: WagmiChainId): Promise<bigint> {
    const result = await this.read("targetReserves", chainId);
    return result as bigint;
  }

  targetReservesCall(): ContractFunctionParameters {
    return this.getCall("targetReserves");
  }

  async threshold(arg0: bigint, chainId?: WagmiChainId): Promise<bigint> {
    const result = await this.read("threshold", chainId, [arg0]);
    return result as bigint;
  }

  thresholdCall(arg0: bigint): ContractFunctionParameters {
    return this.getCall("threshold", [arg0]);
  }

  async treasury(chainId?: WagmiChainId): Promise<Address> {
    const result = await this.read("treasury", chainId);
    return result as Address;
  }

  treasuryCall(): ContractFunctionParameters {
    return this.getCall("treasury");
  }

  async addBaseAssetCurve(
    token: Address,
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
    chainId?: WagmiChainId,
  ): Promise<WriteContractReturnType> {
    return this.write("addBaseAssetCurve", chainId, [token, baseAssetCurve]);
  }

  async changeBaseAssetCurve(
    token: Address,
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
    chainId?: WagmiChainId,
  ): Promise<WriteContractReturnType> {
    return this.write("changeBaseAssetCurve", chainId, [
      token,
      curveIndex,
      newCurve,
    ]);
  }

  async setConfiguration(
    config: {
      storeFrontPriceFactor: bigint;
      minUpdateTime: bigint;
      suggestedAmountOfSeedReserves: bigint;
      suggestedLockTimeOfSeedReserves: bigint;
    },
    chainId?: WagmiChainId,
  ): Promise<WriteContractReturnType> {
    return this.write("setConfiguration", chainId, [config]);
  }

  async setFeeEnabled(
    feeEnabled: boolean,
    chainId?: WagmiChainId,
  ): Promise<WriteContractReturnType> {
    return this.write("setFeeEnabled", chainId, [feeEnabled]);
  }

  async setTreasury(
    treasury: Address,
    chainId?: WagmiChainId,
  ): Promise<WriteContractReturnType> {
    return this.write("setTreasury", chainId, [treasury]);
  }

  async transferDao(
    newDao: Address,
    chainId?: WagmiChainId,
  ): Promise<WriteContractReturnType> {
    return this.write("transferDao", chainId, [newDao]);
  }

  async transferOwner(
    newOwner: Address,
    chainId?: WagmiChainId,
  ): Promise<WriteContractReturnType> {
    return this.write("transferOwner", chainId, [newOwner]);
  }

  async whitelistBaseAsset(
    token: Address,
    priceFeed: Address,
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
    chainId?: WagmiChainId,
  ): Promise<WriteContractReturnType> {
    return this.write("whitelistBaseAsset", chainId, [
      token,
      priceFeed,
      baseAssetCurve,
      minBorrow,
    ]);
  }

  async whitelistCollateralAsset(
    token: Address,
    priceFeed: Address,
    minBorrowCollateralFactor: bigint,
    maxBorrowCollateralFactor: bigint,
    minLiquidateCollateralFactor: bigint,
    maxLiquidateCollateralFactor: bigint,
    minLiquidationFactor: bigint,
    maxLiquidationFactor: bigint,
    chainId?: WagmiChainId,
  ): Promise<WriteContractReturnType> {
    return this.write("whitelistCollateralAsset", chainId, [
      token,
      priceFeed,
      minBorrowCollateralFactor,
      maxBorrowCollateralFactor,
      minLiquidateCollateralFactor,
      maxLiquidateCollateralFactor,
      minLiquidationFactor,
      maxLiquidationFactor,
    ]);
  }
}
