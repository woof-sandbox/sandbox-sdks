import { BaseContract } from "@sandbox/contracts-tools-sdk-ethers";
import type { BigNumberish, Provider, Signer, ethers } from "ethers";
import { CometAbi } from "../abis";
import type { ContractCall } from "./entities";

export class CometContract extends BaseContract {
  constructor(address?: string, driver?: Provider | Signer) {
    super(CometAbi, address, driver!);
  }

  async getUtilization(): Promise<bigint> {
    const result = await this.call("getUtilization");
    return result as any;
  }
  getUtilizationCall(): ContractCall {
    return this.getCall("getUtilization") as ContractCall;
  }
  numAssets(): Promise<bigint> {
    return this.call("numAssets");
  }
  getNumAssetsCall(): ContractCall {
    return this.getCall("numAssets") as ContractCall;
  }
  getAssetInfoCall(index: number): ContractCall {
    return this.getCall("getAssetInfo", [index]) as ContractCall;
  }

  getBorrowRateCall(utilization: BigNumberish): ContractCall {
    return this.getCall("getBorrowRate", [utilization]) as ContractCall;
  }
  getSupplyRateCall(utilization: BigNumberish): ContractCall {
    return this.getCall("getSupplyRate", [utilization]) as ContractCall;
  }
  //
  getTotalBorrowCall(): ContractCall {
    return this.getCall("totalBorrow") as ContractCall;
  }
  getTotalSupplyCall(): ContractCall {
    return this.getCall("totalSupply") as ContractCall;
  }
  getReservesCall(): ContractCall {
    return this.getCall("getReserves") as ContractCall;
  }
  getBaseTokenCall(): ContractCall {
    return this.getCall("baseToken") as  ContractCall;
  }
  //
  async isAllowed(owner: string, bulker: string): Promise<boolean> {
    return this.call<boolean>("isAllowed", [owner, bulker]);
  }
  isAllowedCall(owner: string, bulker: string): ContractCall {
    return this.getCall("isAllowed", [owner, bulker]) as ContractCall;
  }
  async allow(
    bulker: string,
    status: boolean,
  ): Promise<ethers.TransactionResponse> {
    return this.call<ethers.TransactionResponse>("allow", [bulker, status]);
  }
  allowCall(bulker: string, status: boolean): ContractCall {
    return this.getCall("allow", [bulker, status]) as ContractCall;
  }
  //
  getBorrowBalanceOfCall(userAddress: string): ContractCall {
    return this.getCall("borrowBalanceOf", [userAddress])  as ContractCall;
  }
  getCollateralBalanceOfCall(userAddress: string): ContractCall {
    return this.getCall("collateralBalanceOf", [userAddress]) as ContractCall;
  }
  getLiquidationFactorCall(): ContractCall {
    return this.getCall("getLiquidationFactor") as ContractCall;
  }

  // CURVE

  getSupplyKinkCall(): ContractCall {
    return this.getCall("supplyKink") as ContractCall;
  }
  getSupplyPerSecondInterestRateSlopeLowCall(): ContractCall {
    return this.getCall("supplyPerSecondInterestRateSlopeLow") as ContractCall;
  }
  getSupplyPerSecondInterestRateSlopeHighCall(): ContractCall {
    return this.getCall("supplyPerSecondInterestRateSlopeHigh") as ContractCall;
  }
  getSupplyPerSecondInterestRateBaseCall(): ContractCall {
    return this.getCall("supplyPerSecondInterestRateSlopeBase") as ContractCall;
  }

  getBorrowKinkCall(): ContractCall {
    return this.getCall("borrowKink") as ContractCall;
  }
  getBorrowPerSecondInterestRateSlopeLowCall(): ContractCall {
    return this.getCall("borrowPerSecondInterestRateSlopeLow") as ContractCall;
  }
  getBorrowPerSecondInterestRateSlopeHighCall(): ContractCall {
    return this.getCall("borrowPerSecondInterestRateSlopeHigh") as ContractCall;
  }
  getBorrowPerSecondInterestRateBaseCall(): ContractCall {
    return this.getCall("borrowPerSecondInterestRateSlopeBase") as ContractCall;
  }

  // BASE

  getBaseTokenPriceFeedCall(): ContractCall {
    return this.getCall("baseTokenPriceFeed") as ContractCall;
  }
  getPriceCall(priceFeedAddress: string): ContractCall {
    return this.getCall("getPrice", [priceFeedAddress]) as ContractCall;
  }
  getBaseMinForRewardsCall(): ContractCall {
    return this.getCall("baseMinForRewards") as ContractCall;
  }
  getBaseTrackingBorrowSpeedCall(): ContractCall {
    return this.getCall("baseTrackingBorrowSpeed") as ContractCall;
  }
  getBaseTrackingSupplySpeedCall(): ContractCall {
    return this.getCall("baseTrackingSupplySpeed") as ContractCall;
  }
  getBaseIndexScaleCall(): ContractCall {
    // Requires additional ABI. Works while it is not showing on scan
    return this.getCall("baseIndexScale") as ContractCall;
  }
}
