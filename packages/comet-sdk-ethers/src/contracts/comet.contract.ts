import { BaseContract, ContractCall } from "@sandbox/contracts-tools-sdk-ethers";
import type { BigNumberish, Provider, Signer, ethers } from "ethers";
import { CometAbi } from "../abis";

export class CometContract extends BaseContract {
  constructor(address?: string, driver?: Provider | Signer) {
    super(CometAbi, address, driver!);
  }

  async getUtilization(): Promise<bigint> {
    return await this.call("getUtilization");
  }
  getUtilizationCall(): ContractCall {
    return this.getCall("getUtilization");
  }
  numAssets(): Promise<bigint> {
    return this.call("numAssets");
  }
  getNumAssetsCall(): ContractCall {
    return this.getCall("numAssets");
  }
  getAssetInfoCall(index: number): ContractCall {
    return this.getCall("getAssetInfo", [index]);
  }

  getBorrowRateCall(utilization: BigNumberish): ContractCall {
    return this.getCall("getBorrowRate", [utilization]);
  }
  getSupplyRateCall(utilization: BigNumberish): ContractCall {
    return this.getCall("getSupplyRate", [utilization]);
  }
  //
  getTotalBorrowCall(): ContractCall {
    return this.getCall("totalBorrow");
  }
  getTotalSupplyCall(): ContractCall {
    return this.getCall("totalSupply");
  }
  getReservesCall(): ContractCall {
    return this.getCall("getReserves");
  }
  getBaseTokenCall(): ContractCall {
    return this.getCall("baseToken") as  ContractCall;
  }
  //
  async isAllowed(owner: string, bulker: string): Promise<boolean> {
    return this.call<boolean>("isAllowed", [owner, bulker]);
  }
  isAllowedCall(owner: string, bulker: string): ContractCall {
    return this.getCall("isAllowed", [owner, bulker]);
  }
  async allow(
    bulker: string,
    status: boolean,
  ): Promise<ethers.TransactionResponse> {
    return this.call<ethers.TransactionResponse>("allow", [bulker, status]);
  }
  allowCall(bulker: string, status: boolean): ContractCall {
    return this.getCall("allow", [bulker, status]);
  }
  //
  getBorrowBalanceOfCall(userAddress: string): ContractCall {
    return this.getCall("borrowBalanceOf", [userAddress]) ;
  }
  getCollateralBalanceOfCall(userAddress: string): ContractCall {
    return this.getCall("collateralBalanceOf", [userAddress]);
  }
  getLiquidationFactorCall(): ContractCall {
    return this.getCall("getLiquidationFactor");
  }

  // CURVE

  getSupplyKinkCall(): ContractCall {
    return this.getCall("supplyKink");
  }
  getSupplyPerSecondInterestRateSlopeLowCall(): ContractCall {
    return this.getCall("supplyPerSecondInterestRateSlopeLow");
  }
  getSupplyPerSecondInterestRateSlopeHighCall(): ContractCall {
    return this.getCall("supplyPerSecondInterestRateSlopeHigh");
  }
  getSupplyPerSecondInterestRateBaseCall(): ContractCall {
    return this.getCall("supplyPerSecondInterestRateBase");
  }

  getBorrowKinkCall(): ContractCall {
    return this.getCall("borrowKink");
  }
  getBorrowPerSecondInterestRateSlopeLowCall(): ContractCall {
    return this.getCall("borrowPerSecondInterestRateSlopeLow");
  }
  getBorrowPerSecondInterestRateSlopeHighCall(): ContractCall {
    return this.getCall("borrowPerSecondInterestRateSlopeHigh");
  }
  getBorrowPerSecondInterestRateBaseCall(): ContractCall {
    return this.getCall("borrowPerSecondInterestRateBase");
  }

  // BASE

  getBaseTokenPriceFeedCall(): ContractCall {
    return this.getCall("baseTokenPriceFeed");
  }
  getPriceCall(priceFeedAddress: string): ContractCall {
    return this.getCall("getPrice", [priceFeedAddress]);
  }
  getBaseMinForRewardsCall(): ContractCall {
    return this.getCall("baseMinForRewards");
  }
  getBaseTrackingBorrowSpeedCall(): ContractCall {
    return this.getCall("baseTrackingBorrowSpeed");
  }
  getBaseTrackingSupplySpeedCall(): ContractCall {
    return this.getCall("baseTrackingSupplySpeed");
  }
  getBaseIndexScaleCall(): ContractCall {
    // Requires additional ABI. Works while it is not showing on scan
    return this.getCall("baseIndexScale");
  }
}
