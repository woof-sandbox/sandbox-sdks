
import { cometAbi } from "../abis";
import {WagmiContract} from "./wagmi-contract";
import {ContractFunctionParameters} from "viem";
import {Config, WriteContractReturnType} from "@wagmi/core";

export class CometContract extends WagmiContract {

  constructor(
      config: Config,
      address: `0x${string}`
  ) {
    super(config, cometAbi, address);
  }

  async getUtilization(): Promise<bigint> {
    const utilization = await this.read("getUtilization");
    return utilization as bigint;
  }
  getUtilizationCall(): ContractFunctionParameters {
    return this.getCall("getUtilization");
  }
  async numAssets(): Promise<bigint> {
    const numAssets = await this.read("numAssets");
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
  async isAllowed(owner: `0x${string}`, bulker: `0x${string}`): Promise<boolean> {
    const isAllowed = await this.read("isAllowed", [owner, bulker]);
    return isAllowed as boolean;
  }
  isAllowedCall(owner: `0x${string}`, bulker: `0x${string}`): ContractFunctionParameters {
    return this.getCall("isAllowed", [owner, bulker]);
  }
  async allow(
    bulker: `0x${string}`,
    status: boolean,
  ): Promise<WriteContractReturnType> {
    return this.write("allow", [bulker, status]);
  }
  getAllowCall(bulker: `0x${string}`, status: boolean): ContractFunctionParameters {
    return this.getCall("allow", [bulker, status]);
  }
  //
  getBorrowBalanceOfCall(userAddress: `0x${string}`): ContractFunctionParameters {
    return this.getCall("borrowBalanceOf", [userAddress]);
  }
  getCollateralBalanceOfCall(userAddress: `0x${string}`): ContractFunctionParameters {
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
