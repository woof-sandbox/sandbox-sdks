import {bulkerAbi} from "../abis";
import {WagmiContract} from "./wagmi-contract";
import type {WagmiChainId} from "../config/chains";
import {wagmiConfig} from "./wagmiConfig";

export class BulkerContract extends WagmiContract {

    constructor(address: `0x${string}`, chainId?: WagmiChainId) {
        super(wagmiConfig, bulkerAbi, address, chainId);
    }


    async invoke(args: any) {
        return this.write("invoke", args);
    }
}
