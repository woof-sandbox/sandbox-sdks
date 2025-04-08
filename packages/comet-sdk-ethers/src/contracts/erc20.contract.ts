import { Contract } from "@sandbox/contracts-tools-sdk-ethers";
import type { BigNumberish, Provider, Signer, ethers } from "ethers";
import { Erc20Abi } from "../abis";
import type { ContractCall } from "./entities";

export class Erc20Contract extends Contract {
  constructor(address: string, driver?: Signer | Provider) {
    super(Erc20Abi, address, driver);
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
    return this.getCall("allowance", [owner, spender]);
  }
  approveCall(spender: string, amount: BigNumberish): ContractCall {
    return this.getCall("approve", [spender, amount]);
  }

  // BASE

  getDecimalsCall(): ContractCall {
    return this.getCall("decimals");
  }
  getSymbolCall(): ContractCall {
    return this.getCall("symbol");
  }

  // MARKET - Base (availableLiquidity)
  getBalanceOfCall(address: string): ContractCall {
    return this.getCall("balanceOf", [address]);
  }
}
