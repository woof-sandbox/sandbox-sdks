import {Address} from "viem";
import {readContract} from "@wagmi/core";
import {config} from "./bulker.contract";
import {cometAbi} from "../abis";

export class MarketContract {
    async getIsAllow(cometAddress: Address,
                     owner: Address,
                     bulker: Address,) {
        return await readContract(config, {
            abi: cometAbi,
            address: cometAddress,
            functionName: 'isAllowed',
            args: [owner, bulker]
        })

    }
}
