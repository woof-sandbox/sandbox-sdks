import {BulkerAbi} from "../abis";
import {createConfig, getWalletClient, http} from "@wagmi/core";
import {arbitrum, mainnet, sepolia} from '@wagmi/core/chains'

export const config = createConfig({
    chains: [mainnet, sepolia, arbitrum],
    transports: {
        [mainnet.id]: http(),
        [arbitrum.id]: http(),
        [sepolia.id]: http(),
    },
})

export class BulkerContract {
    constructor() {
    }

    async invokeBulker(bulkerAddress: `0x${string}`, args: any): Promise<any> {
        const walletClient = await getWalletClient(config)

        return walletClient.writeContract({
            abi: BulkerAbi,
            address: bulkerAddress,
            functionName: 'invoke',
            args,
        });
    }

}
