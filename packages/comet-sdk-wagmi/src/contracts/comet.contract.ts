import type { WriteContractReturnType } from "@wagmi/core";
import type { ContractFunctionParameters } from "viem";
import { cometAbi } from "../abis";
import type { WagmiChainId } from "../config/chains";
import { WagmiContract } from "./wagmi-contract";
import { wagmiConfig } from "./wagmiConfig";

export class CometContract extends WagmiContract {
  constructor(address: `0x${string}`, chainId?: WagmiChainId) {
    super(wagmiConfig, cometAbi, address, chainId);
  }

  async getUtilization(chainId?: WagmiChainId): Promise<bigint> {
    const utilization = await this.read("getUtilization", chainId);
    return utilization as bigint;
  }
  getUtilizationCall(): ContractFunctionParameters {
    return this.getCall("getUtilization");
  }
  async numAssets(chainId?: WagmiChainId): Promise<bigint> {
    const numAssets = await this.read("numAssets", chainId);
    return numAssets as bigint;
  }
  getNumAssetsCall(): ContractFunctionParameters {
    return this.getCall("numAssets");
  }
  getAssetInfoCall(index: number): ContractFunctionParameters {
    return this.getCall("getAssetInfo", [index]);
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
  getBaseTokenCall(): ContractFunctionParameters {
    return this.getCall("baseToken");
  }
  //
  async isAllowed(
    owner: `0x${string}`,
    bulker: `0x${string}`,
    chainId?: WagmiChainId,
  ): Promise<boolean> {
    const isAllowed = await this.read("isAllowed", chainId, [owner, bulker]);
    return isAllowed as boolean;
  }
  isAllowedCall(
    owner: `0x${string}`,
    bulker: `0x${string}`,
  ): ContractFunctionParameters {
    return this.getCall("isAllowed", [owner, bulker]);
  }
  async allow(
    bulker: `0x${string}`,
    status: boolean,
    chainId?: WagmiChainId,
  ): Promise<WriteContractReturnType> {
    return this.write("allow", chainId, [bulker, status]);
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
  getBaseBorrowMinCall(): ContractFunctionParameters {
    return this.getCall("baseBorrowMin");
  }
  getDecimalsCall(): ContractFunctionParameters {
    return this.getCall("decimals");
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
  getBaseMinForRewardsCall(): ContractFunctionParameters {
    return this.getCall("baseMinForRewards");
  }
  getBaseTrackingBorrowSpeedCall(): ContractFunctionParameters {
    return this.getCall("baseTrackingBorrowSpeed");
  }
  getBaseTrackingSupplySpeedCall(): ContractFunctionParameters {
    return this.getCall("baseTrackingSupplySpeed");
  }
  getBaseIndexScaleCall(): ContractFunctionParameters {
    // Requires additional ABI. Works while it is not showing on scan
    return this.getCall("baseIndexScale");
  }
}
