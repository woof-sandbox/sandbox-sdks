import { Config, multicall, type WriteContractReturnType } from "@wagmi/core";
import type { Address, ContractFunctionParameters } from "viem";
import { erc20Abi } from "../abis";
import type { WagmiChainId } from "../config/chains";
import type { MultiAllowanceCallType } from "./entities/multi-allowance-call";
import type { MultiAllowanceResponseType } from "./entities/multi-allowance-result";
import { WagmiContract } from "./wagmi-contract";
import { wagmiConfig } from "./wagmiConfig";

export class Erc20Contract extends WagmiContract {
  constructor(
    address: `0x${string}`,
    chainId?: WagmiChainId,
    config: Config = wagmiConfig,
  ) {
    super(config, erc20Abi, address, chainId);
  }

  async allowance(
    owner: `0x${string}`,
    spender: `0x${string}`,
    chainId?: WagmiChainId,
  ): Promise<bigint> {
    const allowance = await this.read("allowance", chainId, [owner, spender]);
    return allowance as bigint;
  }

  async getMultiAllowance(
    tokensData: MultiAllowanceCallType[],
    chainId: any,
    owner: Address,
    spender: Address,
  ): Promise<MultiAllowanceResponseType[]> {
    const tokensAllowance = await multicall(wagmiConfig, {
      chainId,
      contracts: tokensData.map(({ tokenAddress }) =>
        this.getCallAddress(tokenAddress, "allowance", [owner, spender]),
      ),
    });

    return tokensData.map((tokenData, index) => {
      const currentTokenAllowance = tokensAllowance[index]?.result as bigint;
      return {
        ...tokenData,
        allowance: currentTokenAllowance,
      };
    });
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
