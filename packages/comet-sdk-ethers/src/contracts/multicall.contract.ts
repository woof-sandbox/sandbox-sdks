import { JsonRpcProvider } from "ethers";
import { MulticallAbi } from "../abis";
import { MULTICALL_ADDRESS } from "../constants";
import { BaseContract } from "./base-contract";
import { ContractCall } from "./contract-call";

interface SplitData { tags: string[], callDatas: string[] }
type Unit = [string, ContractCall];
type Result = [string, unknown];

export class MulticallContract extends BaseContract {
    private units: Unit[] = [];
    private results: Result[] = [];
    private data: Map<string, unknown> = new Map();

    constructor(provider: JsonRpcProvider) {
        super(provider, MULTICALL_ADDRESS, MulticallAbi);
    }

    add(tag: string, contractCall: ContractCall): string {
        this.units.push([tag, contractCall]);
        return tag;
    }

    get result() {
        return this.results;
    }

    getData<T>(tag: string): T {
        return this.data.get(tag) as T;
    }

    async run<T>(): Promise<T> {
        const split = this.units.reduce((acc, [tag, call]) => {
            acc.tags.push(tag);
            acc.callDatas.push(call.callData);
            return acc;
        }, {
            tags: [],
            callDatas: [],
        } as SplitData);
        const [isSuccess, returnData] = await this.contract.aggregate!(split.callDatas);

        this.results = split.tags.reduce((acc, tag, index) => {
            const data = returnData[index];
            this.data.set(tag, data)
            acc.push([tag, data]);
            return acc;
        }, [] as Result[]);

        return returnData;
    }
}
