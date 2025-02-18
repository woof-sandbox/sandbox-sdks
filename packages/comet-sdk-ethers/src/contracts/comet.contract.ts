import { BigNumberish, JsonRpcProvider } from "ethers";
import { CometAbi } from "../abis";
import { MULTICALL_ALLOW_FAILURE } from "../constants";
import { BaseContract } from "./base-contract";
import { ContractCall } from "./contract-call";

export class CometContract extends BaseContract {
    constructor(provider?: JsonRpcProvider, address?: string) {
        super(CometAbi, address, provider);
    }

    async getUtilization(): Promise<bigint> {
        return this.contract.getUtilization!();
    }

    getBorrowRateCall(utilization: BigNumberish): ContractCall {
        return {
            method: 'getBorrowRate',
            target: this.address,
            allowFailure: MULTICALL_ALLOW_FAILURE,
            callData: this.interface.encodeFunctionData('getBorrowRate', [utilization]),
        };
    }

    getSupplyRateCall(utilization: BigNumberish): ContractCall {
        return {
            method: 'getSupplyRate',
            target: this.address,
            allowFailure: MULTICALL_ALLOW_FAILURE,
            callData: this.interface.encodeFunctionData('getSupplyRate', [utilization]),
        };
    }
}
