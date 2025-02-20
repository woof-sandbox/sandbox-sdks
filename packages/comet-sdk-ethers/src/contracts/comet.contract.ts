import type {
  BigNumberish,
  JsonRpcProvider,
  Wallet,
  WebSocketProvider,
  ethers,
} from "ethers";
import { CometAbi } from "../abis";
import { BaseContract } from "./base-contract";
import type { ContractCall } from "./entities";

export class CometContract extends BaseContract {
  constructor(
    address?: string,
    driver?: JsonRpcProvider | WebSocketProvider | Wallet,
  ) {
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
}
