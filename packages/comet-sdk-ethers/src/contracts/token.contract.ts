import {multicall, readContract} from "@wagmi/core";
import type {Address} from "viem";
import {erc20Abi} from "../abis";
import {config} from "./bulker.contract";
import {MultiAllowanceCallType} from "./entities/multi-allowance-call";
import {MultiAllowanceResponseType} from "./entities/multi-allowance-result";

export class TokenContract {
    async getAllowance(tokenAddress: Address, owner: Address, spender: Address) {
        return await readContract(config, {
            abi: erc20Abi,
            address: tokenAddress,
            functionName: "allowance",
            args: [owner, spender],
        });
    }

    async getMultiAllowance(tokensData: MultiAllowanceCallType[], chainId: any, owner: Address, spender: Address): Promise<MultiAllowanceResponseType[]> {
        const tokensAllowance = await multicall(config, {
            chainId,
            contracts: tokensData.map(({tokenAddress}) => ({
                address: tokenAddress,
                abi: erc20Abi,
                functionName: "allowance",
                args: [owner, spender],
            } as const)),
        });

        return tokensData.map((tokenData, index) => {
            const currentTokenAllowance = tokensAllowance[index]?.result;
            return {
                ...tokenData,
                allowance: currentTokenAllowance,
            }
        })
    }
}
