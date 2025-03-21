import type { BigNumberish, Provider, Signer, ethers } from "ethers";
import { CometAbi } from "../abis";
import { BaseContract } from "./base-contract";
import type { ContractCall } from "./entities";

export class CometContract extends BaseContract {
  constructor(address?: string, driver?: Provider | Signer) {
    super(CometAbi, address, driver);
  }

  async getUtilization(): Promise<bigint> {
    return this.call<bigint>("getUtilization");
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
  getTotalReservesCall(): ContractCall {
    return this.getCall("totalReserves");
  }
  getBaseTokenCall(): ContractCall {
    return this.getCall("baseToken");
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
    return this.getCall("borrowBalanceOf", [userAddress]);
  }
  getCollateralBalanceOfCall(userAddress: string): ContractCall {
    return this.getCall("collateralBalanceOf", [userAddress]);
  }
  getLiquidationFactorCall(): ContractCall {
    return this.getCall("getLiquidationFactor");
  }
}
