import { BaseContract } from "@sandbox/contracts-tools-sdk-ethers";
import type { BigNumberish, Provider, Signer, ethers } from "ethers";
import { Erc20Abi } from "../abis";
import type { ContractCall } from "./entities";

export class Erc20Contract extends BaseContract {
  constructor(address: string, driver?: Signer | Provider) {
    super(Erc20Abi, address, driver!);
  }

  async allowance(owner: string, spender: string): Promise<bigint> {
    return this.call<bigint>("allowance", [owner, spender]);
  }
  async approve(
    spender: string,
    amount: BigNumberish,
  ): Promise<ethers.TransactionResponse> {
    return this.call<ethers.TransactionResponse>("approve", [spender, amount]);
  }

  allowanceCall(owner: string, spender: string): ContractCall {
    return this.getCall("allowance", [owner, spender]) as ContractCall;
  }
  approveCall(spender: string, amount: BigNumberish): ContractCall {
    return this.getCall("approve", [spender, amount]) as ContractCall;
  }

  // BASE

  getDecimalsCall(): ContractCall {
    return this.getCall("decimals") as ContractCall;
  }
  getSymbolCall(): ContractCall {
    return this.getCall("symbol") as ContractCall;
  }

  // MARKET - Base (availableLiquidity)
  getBalanceOfCall(address: string): ContractCall {
    return this.getCall("balanceOf", [address]) as ContractCall;
  }
}
