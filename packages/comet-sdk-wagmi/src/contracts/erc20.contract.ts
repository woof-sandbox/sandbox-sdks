import {
  type Config,
  type WriteContractReturnType,
  multicall,
} from "@wagmi/core";
import type { Address, ContractFunctionParameters } from "viem";
import { erc20Abi } from "../abis";
import type { WagmiChainId } from "../config";
import { CHAIN_ID_WAS_NOT_PROVIDED } from "../errors/wrappers/user-market-wrapper.errors";
import type { MultiAllowanceCallType } from "./entities/multi-allowance-call";
import type { MultiAllowanceResponseType } from "./entities/multi-allowance-result";
import { WagmiContract } from "./wagmi-contract";
import { wagmiConfig } from "./wagmiConfig";

export class Erc20Contract extends WagmiContract {
  constructor(
    address: Address,
    chainId?: WagmiChainId,
    config: Config = wagmiConfig,
  ) {
    super(config, erc20Abi, address, chainId);
  }

  async allowance(owner: Address, spender: Address): Promise<bigint> {
    const allowance = await this.read("allowance", this.chainId, [
      owner,
      spender,
    ]);
    return allowance as bigint;
  }

  async getMultiAllowance(
    tokensData: MultiAllowanceCallType[],
    owner: Address,
    spender: Address,
    chainId?: WagmiChainId,
  ): Promise<MultiAllowanceResponseType[]> {
    const chain = chainId ?? this.chainId;
    if (chain === undefined) {
      throw CHAIN_ID_WAS_NOT_PROVIDED();
    }

    const tokensAllowance = await multicall(wagmiConfig, {
      chainId: chain,
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
    spender: Address,
    amount: bigint,
  ): Promise<WriteContractReturnType> {
    return this.write("approve", this.chainId, [spender, amount]);
  }

  getAllowanceCall(
    owner: Address,
    spender: Address,
  ): ContractFunctionParameters {
    return this.getCall("allowance", [owner, spender]);
  }

  // BASE

  getDecimalsCall(): ContractFunctionParameters {
    return this.getCall("decimals");
  }

  getSymbolCall(): ContractFunctionParameters {
    return this.getCall("symbol");
  }

  // MARKET - Base (availableLiquidity)
  getBalanceOfCall(address: Address): ContractFunctionParameters {
    return this.getCall("balanceOf", [address]);
  }
}
