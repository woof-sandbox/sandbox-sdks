import type { Config, WriteContractReturnType } from "@wagmi/core";
import type { ContractFunctionParameters } from "viem";
import { cometAbi } from "../abis";
import type { WagmiChainId } from "../config";
import { WagmiContract } from "./wagmi-contract";
import { wagmiConfig } from "./wagmiConfig";

export interface AssetConfig {
  collateralToken: `0x${string}`;
  priceFeed: `0x${string}`;
  borrowCollateralFactor: bigint;
  liquidateCollateralFactor: bigint;
  liquidationFactor: bigint;
  supplyCap: bigint;
  scale: bigint;
}

export interface MarketConfig {
  governor: `0x${string}`;
  pauseGuardian: `0x${string}`;
  baseToken: `0x${string}`;
  baseTokenPriceFeed: `0x${string}`;
  extensionDelegate: `0x${string}`;
  supplyKink: bigint;
  supplyPerYearInterestRateSlopeLow: bigint;
  supplyPerYearInterestRateSlopeHigh: bigint;
  supplyPerYearInterestRateBase: bigint;
  borrowKink: bigint;
  borrowPerYearInterestRateSlopeLow: bigint;
  borrowPerYearInterestRateSlopeHigh: bigint;
  borrowPerYearInterestRateBase: bigint;
  storeFrontPriceFactor: bigint;
  trackingIndexScale: bigint;
  baseTrackingSupplySpeed: bigint;
  baseTrackingBorrowSpeed: bigint;
  baseMinForRewards: bigint;
  baseBorrowMin: bigint;
  targetReserves: bigint;
  assetConfigs: AssetConfig[];
}

export class CometContract extends WagmiContract {
  constructor(
    address: `0x${string}`,
    chainId?: WagmiChainId,
    config: Config = wagmiConfig,
  ) {
    super(config, cometAbi, address, chainId);
  }

  getTotalsCollateralCall(
    collateralAddress: `0x${string}`,
  ): ContractFunctionParameters {
    return this.getCall("totalsCollateral", [collateralAddress]);
  }

  getCollateralReservesCall(
    collateralAddress: `0x${string}`,
  ): ContractFunctionParameters {
    return this.getCall("getCollateralReserves", [collateralAddress]);
  }

  async getUtilization(): Promise<bigint> {
    const utilization = await this.read("getUtilization", this.chainId);
    return utilization as bigint;
  }

  getUtilizationCall(): ContractFunctionParameters {
    return this.getCall("getUtilization");
  }

  async numAssets(): Promise<bigint> {
    const numAssets = await this.read("numAssets", this.chainId);
    return numAssets as bigint;
  }

  getNumAssetsCall(): ContractFunctionParameters {
    return this.getCall("numAssets");
  }

  getAssetInfoCall(index: number): ContractFunctionParameters {
    return this.getCall("getAssetInfo", [index]);
  }

  getDecimalsCall(): ContractFunctionParameters {
    return this.getCall("decimals");
  }

  getBorrowRateCall(utilization: bigint): ContractFunctionParameters {
    return this.getCall("getBorrowRate", [utilization]);
  }

  getSupplyRateCall(utilization: bigint): ContractFunctionParameters {
    return this.getCall("getSupplyRate", [utilization]);
  }

  //
  getTotalBorrowCall(): ContractFunctionParameters {
    return this.getCall("totalBorrow");
  }

  getTotalSupplyCall(): ContractFunctionParameters {
    return this.getCall("totalSupply");
  }

  getReservesCall(): ContractFunctionParameters {
    return this.getCall("getReserves");
  }

  getBaseBorrowMinCall(): ContractFunctionParameters {
    return this.getCall("baseBorrowMin");
  }

  getBaseTokenCall(): ContractFunctionParameters {
    return this.getCall("baseToken");
  }

  async isAllowed(
    owner: `0x${string}`,
    bulker: `0x${string}`,
  ): Promise<boolean> {
    const isAllowed = await this.read("isAllowed", this.chainId, [
      owner,
      bulker,
    ]);
    return isAllowed as boolean;
  }

  getIsAllowedCall(
    owner: `0x${string}`,
    bulker: `0x${string}`,
  ): ContractFunctionParameters {
    return this.getCall("isAllowed", [owner, bulker]);
  }

  async allow(
    bulker: `0x${string}`,
    status: boolean,
  ): Promise<WriteContractReturnType> {
    return this.write("approve", this.chainId, [
      bulker,
      "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff", // MAX amount
    ]);
  }

  getAllowCall(
    bulker: `0x${string}`,
    status: boolean,
  ): ContractFunctionParameters {
    return this.getCall("allow", [bulker, status]);
  }

  //
  getBalanceOfCall(userAddress: `0x${string}`): ContractFunctionParameters {
    return this.getCall("balanceOf", [userAddress]);
  }

  getBorrowBalanceOfCall(
    userAddress: `0x${string}`,
  ): ContractFunctionParameters {
    return this.getCall("borrowBalanceOf", [userAddress]);
  }

  getCollateralBalanceOfCall(
    userAddress: `0x${string}`,
  ): ContractFunctionParameters {
    return this.getCall("collateralBalanceOf", [userAddress]);
  }

  getLiquidationFactorCall(): ContractFunctionParameters {
    return this.getCall("getLiquidationFactor");
  }

  // CURVE

  getSupplyKinkCall(): ContractFunctionParameters {
    return this.getCall("supplyKink");
  }

  getSupplyPerSecondInterestRateSlopeLowCall(): ContractFunctionParameters {
    return this.getCall("supplyPerSecondInterestRateSlopeLow");
  }

  getSupplyPerSecondInterestRateSlopeHighCall(): ContractFunctionParameters {
    return this.getCall("supplyPerSecondInterestRateSlopeHigh");
  }

  getSupplyPerSecondInterestRateBaseCall(): ContractFunctionParameters {
    return this.getCall("supplyPerSecondInterestRateBase");
  }

  getBorrowKinkCall(): ContractFunctionParameters {
    return this.getCall("borrowKink");
  }

  getBorrowPerSecondInterestRateSlopeLowCall(): ContractFunctionParameters {
    return this.getCall("borrowPerSecondInterestRateSlopeLow");
  }

  getBorrowPerSecondInterestRateSlopeHighCall(): ContractFunctionParameters {
    return this.getCall("borrowPerSecondInterestRateSlopeHigh");
  }

  getBorrowPerSecondInterestRateBaseCall(): ContractFunctionParameters {
    return this.getCall("borrowPerSecondInterestRateBase");
  }

  // BASE

  getBaseTokenPriceFeedCall(): ContractFunctionParameters {
    return this.getCall("baseTokenPriceFeed");
  }

  getPriceCall(priceFeedAddress: `0x${string}`): ContractFunctionParameters {
    return this.getCall("getPrice", [priceFeedAddress]);
  }

  getUserCollateralCall(
    userAddress: `0x${string}`,
    tokenAddress: `0x${string}`,
  ): ContractFunctionParameters {
    return this.getCall("userCollateral", [userAddress, tokenAddress]);
  }

  getBaseMinForRewardsCall(): ContractFunctionParameters {
    return this.getCall("baseMinForRewards");
  }

  getBaseTrackingBorrowSpeedCall(): ContractFunctionParameters {
    return this.getCall("baseTrackingBorrowSpeed");
  }

  getBaseTrackingSupplySpeedCall(): ContractFunctionParameters {
    return this.getCall("baseTrackingSupplySpeed");
  }

  getBaseScaleCall(): ContractFunctionParameters {
    // Requires additional ABI. Works while it is not showing on scan
    return this.getCall("baseScale");
  }

  async getConfiguration(): Promise<MarketConfig> {
    const configuration = await this.read("getConfiguration");
    return configuration as MarketConfig;
  }
}
