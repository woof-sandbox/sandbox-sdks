import { erc20Abi } from "../abis";
import {WagmiContract} from "./wagmi-contract";
import {Config, WriteContractReturnType} from "@wagmi/core";
import {ContractFunctionParameters} from "viem";

export class Erc20Contract extends WagmiContract {
  constructor(
      config: Config,
      address: `0x${string}`
  ) {
    super(config, erc20Abi, address);
  }

  async allowance(owner: `0x${string}`, spender: `0x${string}`): Promise<bigint> {
    const allowance = await this.read("allowance", [owner, spender]);
    return allowance as bigint;
  }
  async approve(
    spender: `0x${string}`,
    amount: bigint,
  ): Promise<WriteContractReturnType> {
    return this.write("approve", [spender, amount]);
  }

  getAllowanceCall(owner: `0x${string}`, spender: `0x${string}`): ContractFunctionParameters {
    return this.getCall("allowance", [owner, spender]);
  }
  // ?: will be removed
  getApproveCall(spender: `0x${string}`, amount: bigint): ContractFunctionParameters {
    return this.getCall("approve", [spender, amount]);
  }

  // BASE

  getDecimalsCall(): ContractFunctionParameters {
    return this.getCall("decimals");
  }
  getSymbolCall(): ContractFunctionParameters {
    return this.getCall("symbol");
  }

  // MARKET - Base (availableLiquidity)
  getBalanceOfCall(address: `0x${string}`): ContractFunctionParameters {
    return this.getCall("balanceOf", [address]);
  }
}
