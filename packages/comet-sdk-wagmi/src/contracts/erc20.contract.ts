import type { WriteContractReturnType } from "@wagmi/core";
import type { ContractFunctionParameters } from "viem";
import { erc20Abi } from "../abis";
import type { WagmiChainId } from "../config/chains";
import { WagmiContract } from "./wagmi-contract";
import { wagmiConfig } from "./wagmiConfig";

export class Erc20Contract extends WagmiContract {
  constructor(address: `0x${string}`, chainId?: WagmiChainId) {
    super(wagmiConfig, erc20Abi, address, chainId);
  }

  async allowance(
    owner: `0x${string}`,
    spender: `0x${string}`,
    chainId?: WagmiChainId,
  ): Promise<bigint> {
    const allowance = await this.read("allowance", chainId, [owner, spender]);
    return allowance as bigint;
  }
  async approve(
    spender: `0x${string}`,
    amount: bigint,
    chainId?: WagmiChainId,
  ): Promise<WriteContractReturnType> {
    return this.write("approve", chainId, [spender, amount]);
  }

  getAllowanceCall(
    owner: `0x${string}`,
    spender: `0x${string}`,
  ): ContractFunctionParameters {
    return this.getCall("allowance", [owner, spender]);
  }
  // ?: will be removed
  getApproveCall(
    spender: `0x${string}`,
    amount: bigint,
  ): ContractFunctionParameters {
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
