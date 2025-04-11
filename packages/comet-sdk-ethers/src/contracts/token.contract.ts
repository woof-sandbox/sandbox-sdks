import {Address} from "viem";
import {readContract} from "@wagmi/core";
import {config} from "./bulker.contract";
import {erc20Abi} from "../abis";

export class TokenContract {
    async getAllowance(userAddress: Address,
                       owner: Address,
                       spender: Address,) {
        return await readContract(config, {
            abi: erc20Abi,
            address: userAddress,
            functionName: 'allowance',
            args: [owner, spender]
        })

    }
}
