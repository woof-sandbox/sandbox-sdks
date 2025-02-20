import { type JsonRpcProvider, type Wallet, ethers } from "ethers";
import { Erc20Contract } from "../../contracts";
import { SERVICES_ERRORS } from "../../errors/services";

export class CollateralService {
    private readonly provider: ethers.JsonRpcProvider;
    private readonly signer?: ethers.Wallet;

    constructor(rpcUrl: string, privateKey?: string) {
        this.provider = new ethers.JsonRpcProvider(rpcUrl);
        if (privateKey) {
            this.signer = new ethers.Wallet(privateKey, this.provider);
        }
    }

    getDriver(): JsonRpcProvider | Wallet {
        if (this.signer) return this.signer;
        return this.provider;
    }

    getSigner(): Wallet {
        if (this.signer) return this.signer;
        throw SERVICES_ERRORS.SIGNER_IS_NOT_PROVIDED;
    }

    async approveCollateral(
        tokenAddress: string,
        spender: string,
        amount: bigint,
    ): Promise<ethers.TransactionResponse> {
        const erc20Contract = new Erc20Contract(tokenAddress, this.getSigner());
        const tx = await erc20Contract.approve(spender, amount);
        return tx;
    }

    /*async supplyCollateral(
        bulkerAddress: string,
        cometAddress: string,
        tokenAddress: string,
        amount: bigint,
        recipient: string,
        isNative = false,
    ): Promise<ethers.TransactionResponse> {
        const bulkerContract = new BulkerContract(bulkerAddress, this.getSigner());

        const actions: `0x${string}`[] = [
            isNative
                ? "0x0000000000000000000000000000000000000001" // ACTION_SUPPLY_NATIVE_TOKEN placeholder
                : "0x0000000000000000000000000000000000000002", // ACTION_SUPPLY_TOKEN placeholder
        ];

        const data: `0x${string}`[] = [
            isNative
                ? ethers.utils.defaultAbiCoder.encode(
                    ["address", "address", "uint"],
                    [cometAddress, recipient, amount],
                )
                : ethers.utils.defaultAbiCoder.encode(
                    ["address", "address", "address", "uint"],
                    [cometAddress, recipient, tokenAddress, amount],
                ),
        ];

        const tx = await bulkerContract.invoke(actions, data, {
            value: isNative ? amount : undefined,
        });

        return tx;
    }*/

}
