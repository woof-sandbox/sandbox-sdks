import {BulkerAbi} from "../abis";
import {createConfig, http, writeContract} from "@wagmi/core";
import {mainnet, sepolia} from '@wagmi/core/chains'

export const config = createConfig({
    chains: [mainnet, sepolia],
    transports: {
        [mainnet.id]: http(),
        [sepolia.id]: http(),
    },
})

export class BulkerContract {
    constructor() {
    }

    invokeFunc(bulkerAddress: `0x${string}`, args: any): Promise<any> {
        return writeContract(config, {
            abi: BulkerAbi,
            address: bulkerAddress,
            functionName: 'invoke',
            args,
        });
    }

}
