import type { BigNumberish, JsonRpcProvider } from "ethers";
import { CometAbi } from "../abis";
import { BaseContract } from "./base-contract";
import type { ContractCall } from "./entities";

export class CometContract extends BaseContract {
  constructor(provider?: JsonRpcProvider, address?: string) {
    super(CometAbi, address, provider);
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
}
