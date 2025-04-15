import {Config} from "@wagmi/core";
import {bulkerAbi} from "../abis";
import {WagmiContract} from "./wagmi-contract";

export class BulkerContract extends WagmiContract {

    constructor(
        config: Config,
        address: `0x${string}`
    ) {
        super(config, bulkerAbi, address);
    }


    async invoke(args: any) {
        return this.write("invoke", args);
    }
}
