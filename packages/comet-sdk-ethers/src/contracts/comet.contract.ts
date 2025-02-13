import { JsonRpcProvider } from "ethers";
import { CometAbi } from "../abis";
import { BaseContract } from "./base-contract";
import { ContractCall } from "./contract-call";

export class CometContract extends BaseContract {
    constructor(provider: JsonRpcProvider, address: string) {
        super(provider, address, CometAbi);
    }

    getBorrowRateCall(): ContractCall {
        return {
            method: 'getBorrowRate',
            target: this.address,
            callData: this.contract.interface.encodeFunctionData('getBorrowRate'),
        };
    }

    getSupplyRateCall(): ContractCall {
        return {
            method: 'getSupplyRate',
            target: this.address,
            callData: this.contract.interface.encodeFunctionData('getSupplyRate'),
        };
    }
}
