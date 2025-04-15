import type { ContractFunctionParameters } from "viem";
import { configuratorAbi } from "../abis";
import type { WagmiChainId } from "../config/chains";
import { WagmiContract } from "./wagmi-contract";
import { wagmiConfig } from "./wagmiConfig";

export interface AssetConfig {
  asset: `0x${string}`;
  priceFeed: `0x${string}`;
  decimals: bigint;
  borrowCollateralFactor: bigint;
  liquidateCollateralFactor: bigint;
  liquidationFactor: bigint;
  supplyCap: bigint;
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

export class ConfiguratorContract extends WagmiContract {
  constructor(address: `0x${string}`, chainId?: WagmiChainId) {
    super(wagmiConfig, configuratorAbi, address, chainId);
  }

  async getConfiguration(
    cometProxyAddress: `0x${string}`,
    chainId?: WagmiChainId,
  ): Promise<MarketConfig> {
    const configuration = await this.read("getConfiguration", chainId, [
      cometProxyAddress,
    ]);
    return configuration as MarketConfig;
  }

  getConfigurationCall(
    cometProxyAddress: `0x${string}`,
  ): ContractFunctionParameters {
    return this.getCall("getConfiguration", [cometProxyAddress]);
  }
}
