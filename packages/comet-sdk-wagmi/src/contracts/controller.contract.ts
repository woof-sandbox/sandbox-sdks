import type { Config, WriteContractReturnType } from "@wagmi/core";
import type { ContractFunctionParameters } from "viem";
import { controllerAbi } from "../abis";
import type { WagmiChainId } from "../config/chains";
import { WagmiContract } from "./wagmi-contract";
import { wagmiConfig } from "./wagmiConfig";

export class ControllerContract extends WagmiContract {
  constructor(
    address: `0x${string}`,
    chainId?: WagmiChainId,
    config: Config = wagmiConfig,
  ) {
    super(config, controllerAbi, address, chainId);
  }

  async _controllerConfiguration(chainId?: WagmiChainId): Promise<{
    storeFrontPriceFactor: bigint;
    minUpdateTime: bigint;
    suggestedAmountOfSeedReserves: bigint;
    suggestedLockTimeOfSeedReserves: bigint;
  }> {
    const result = await this.read("_controllerConfiguration", chainId);

    const [
      storeFrontPriceFactor,
      minUpdateTime,
      suggestedAmountOfSeedReserves,
      suggestedLockTimeOfSeedReserves,
    ] = result as [bigint, bigint, bigint, bigint];
    return {
      storeFrontPriceFactor,
      minUpdateTime,
      suggestedAmountOfSeedReserves,
      suggestedLockTimeOfSeedReserves,
    };
  }

  _controllerConfigurationCall(): ContractFunctionParameters {
    return this.getCall("_controllerConfiguration");
  }

  async baseAssetCount(chainId?: WagmiChainId): Promise<bigint> {
    const result = await this.read("baseAssetCount", chainId);
    return result as bigint;
  }

  baseAssetCountCall(): ContractFunctionParameters {
    return this.getCall("baseAssetCount");
  }

  async baseAssetTokens(
    arg0: bigint,
    chainId?: WagmiChainId,
  ): Promise<`0x${string}`> {
    const result = await this.read("baseAssetTokens", chainId, [arg0]);
    return result as `0x${string}`;
  }

  baseAssetTokensCall(arg0: bigint): ContractFunctionParameters {
    return this.getCall("baseAssetTokens", [arg0]);
  }

  async baseAssets(token: `0x${string}`, chainId?: WagmiChainId): Promise<any> {
    const result = await this.read("baseAssets", chainId, [token]);
    return result as any;
  }

  baseAssetsCall(token: `0x${string}`): ContractFunctionParameters {
    return this.getCall("baseAssets", [token]);
  }

  async collateralAssetCount(chainId?: WagmiChainId): Promise<bigint> {
    const result = await this.read("collateralAssetCount", chainId);
    return result as bigint;
  }

  collateralAssetCountCall(): ContractFunctionParameters {
    return this.getCall("collateralAssetCount");
  }

  async collateralAssetTokens(
    arg0: bigint,
    chainId?: WagmiChainId,
  ): Promise<`0x${string}`> {
    const result = await this.read("collateralAssetTokens", chainId, [arg0]);
    return result as `0x${string}`;
  }

  collateralAssetTokensCall(arg0: bigint): ContractFunctionParameters {
    return this.getCall("collateralAssetTokens", [arg0]);
  }

  async collateralAssets(
    token: `0x${string}`,
    chainId?: WagmiChainId,
  ): Promise<any> {
    const result = await this.read("collateralAssets", chainId, [token]);
    return result as any;
  }

  collateralAssetsCall(token: `0x${string}`): ContractFunctionParameters {
    return this.getCall("collateralAssets", [token]);
  }

  async controllerConfiguration(chainId?: WagmiChainId): Promise<any> {
    const result = await this.read("controllerConfiguration", chainId);
    return result as any;
  }

  controllerConfigurationCall(): ContractFunctionParameters {
    return this.getCall("controllerConfiguration");
  }

  async dao(chainId?: WagmiChainId): Promise<`0x${string}`> {
    const result = await this.read("dao", chainId);
    return result as `0x${string}`;
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

  async getBaseAssetCurves(
    token: `0x${string}`,
    chainId?: WagmiChainId,
  ): Promise<any> {
    const result = await this.read("getBaseAssetCurves", chainId, [token]);
    return result as any;
  }

  getBaseAssetCurvesCall(token: `0x${string}`): ContractFunctionParameters {
    return this.getCall("getBaseAssetCurves", [token]);
  }

  async isBaseTokenWhitelisted(
    token: `0x${string}`,
    chainId?: WagmiChainId,
  ): Promise<boolean> {
    const result = await this.read("isBaseTokenWhitelisted", chainId, [token]);
    return result as boolean;
  }

  isBaseTokenWhitelistedCall(token: `0x${string}`): ContractFunctionParameters {
    return this.getCall("isBaseTokenWhitelisted", [token]);
  }

  async isCollateralTokenWhitelisted(
    token: `0x${string}`,
    chainId?: WagmiChainId,
  ): Promise<boolean> {
    const result = await this.read("isCollateralTokenWhitelisted", chainId, [
      token,
    ]);
    return result as boolean;
  }

  isCollateralTokenWhitelistedCall(
    token: `0x${string}`,
  ): ContractFunctionParameters {
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

  async isPriceFeedWhitelisted(
    arg0: `0x${string}`,
    chainId?: WagmiChainId,
  ): Promise<boolean> {
    const result = await this.read("isPriceFeedWhitelisted", chainId, [arg0]);
    return result as boolean;
  }

  isPriceFeedWhitelistedCall(arg0: `0x${string}`): ContractFunctionParameters {
    return this.getCall("isPriceFeedWhitelisted", [arg0]);
  }

  async maxCollateralAssets(chainId?: WagmiChainId): Promise<bigint> {
    const result = await this.read("maxCollateralAssets", chainId);
    return result as bigint;
  }

  maxCollateralAssetsCall(): ContractFunctionParameters {
    return this.getCall("maxCollateralAssets");
  }

  async owner(chainId?: WagmiChainId): Promise<`0x${string}`> {
    const result = await this.read("owner", chainId);
    return result as `0x${string}`;
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

  async protocolFactorBorrow(chainId?: WagmiChainId): Promise<bigint> {
    const result = await this.read("protocolFactorBorrow", chainId);
    return result as bigint;
  }

  protocolFactorBorrowCall(): ContractFunctionParameters {
    return this.getCall("protocolFactorBorrow");
  }

  async protocolFactorLiquidation(chainId?: WagmiChainId): Promise<bigint> {
    const result = await this.read("protocolFactorLiquidation", chainId);
    return result as bigint;
  }

  protocolFactorLiquidationCall(): ContractFunctionParameters {
    return this.getCall("protocolFactorLiquidation");
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

  async reserveFactorBorrow(chainId?: WagmiChainId): Promise<bigint> {
    const result = await this.read("reserveFactorBorrow", chainId);
    return result as bigint;
  }

  reserveFactorBorrowCall(): ContractFunctionParameters {
    return this.getCall("reserveFactorBorrow");
  }

  async reserveFactorLiquidation(chainId?: WagmiChainId): Promise<bigint> {
    const result = await this.read("reserveFactorLiquidation", chainId);
    return result as bigint;
  }

  reserveFactorLiquidationCall(): ContractFunctionParameters {
    return this.getCall("reserveFactorLiquidation");
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

  async treasury(chainId?: WagmiChainId): Promise<`0x${string}`> {
    const result = await this.read("treasury", chainId);
    return result as `0x${string}`;
  }

  treasuryCall(): ContractFunctionParameters {
    return this.getCall("treasury");
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
    chainId?: WagmiChainId,
  ): Promise<WriteContractReturnType> {
    return this.write("addBaseAssetCurve", chainId, [token, baseAssetCurve]);
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

  async setProtocolCommissions(
    protocolCommissions: [bigint, bigint, bigint],
    chainId?: WagmiChainId,
  ): Promise<WriteContractReturnType> {
    return this.write("setProtocolCommissions", chainId, [protocolCommissions]);
  }

  async setReserveCommissions(
    reserveCommissions: [bigint, bigint, bigint],
    chainId?: WagmiChainId,
  ): Promise<WriteContractReturnType> {
    return this.write("setReserveCommissions", chainId, [reserveCommissions]);
  }

  async setTargetReserves(
    targetReserves: bigint,
    chainId?: WagmiChainId,
  ): Promise<WriteContractReturnType> {
    return this.write("setTargetReserves", chainId, [targetReserves]);
  }

  async setThresholds(
    thresholds: [bigint, bigint, bigint],
    chainId?: WagmiChainId,
  ): Promise<WriteContractReturnType> {
    return this.write("setThresholds", chainId, [thresholds]);
  }

  async setTreasury(
    treasury: `0x${string}`,
    chainId?: WagmiChainId,
  ): Promise<WriteContractReturnType> {
    return this.write("setTreasury", chainId, [treasury]);
  }

  async transferDao(
    newDao: `0x${string}`,
    chainId?: WagmiChainId,
  ): Promise<WriteContractReturnType> {
    return this.write("transferDao", chainId, [newDao]);
  }

  async transferOwner(
    newOwner: `0x${string}`,
    chainId?: WagmiChainId,
  ): Promise<WriteContractReturnType> {
    return this.write("transferOwner", chainId, [newOwner]);
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
    token: `0x${string}`,
    priceFeed: `0x${string}`,
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
