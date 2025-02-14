import {Interface, JsonRpcProvider} from "ethers";
import { MulticallAbi } from "../abis";
import { MULTICALL_ADDRESS } from "../constants";
import { BaseContract } from "./base-contract";
import { ContractCall } from "./contract-call";

interface SplitData { tags: string[], calls: ContractCall[] }
type Unit = [string, ContractCall];
type Result = [string, unknown];

type Response = [success: boolean, rawData: string];
const isSuccess = (responses: Response[]) => responses.every(el => el[0]);


export class MulticallContract extends BaseContract {
    private units: Unit[] = [];
    private results: Result[] = [];
    private rawData: Map<string, string> = new Map();

    constructor(provider: JsonRpcProvider) {
        super(provider, MULTICALL_ADDRESS, MulticallAbi);
    }

    add(tag: string, contractCall: ContractCall): string {
        this.units.push([tag, contractCall]);
        return tag;
    }

    get rawResults(): Result[] {
        return this.results;
    }

    getRaw(tag: string): string | undefined {
        return this.rawData.get(tag);
    }

    getSingle<T>(tag: string, methodName: string, contractInterface: Interface): T | undefined {
        const raw = this.rawData.get(tag);
        if (!raw) return;
        return contractInterface.decodeFunctionResult(
            methodName,
            raw,
        )[0] as T;
    }

    async run(): Promise<boolean> {
        const split = this.units.reduce((acc, [tag, call]) => {
            acc.tags.push(tag);
            acc.calls.push(call);
            return acc;
        }, {
            tags: [],
            calls: [],
        } as SplitData);

        const response: Response[] = await this.contract.aggregate3.staticCall(split.calls);

        if (!isSuccess(response)) return false;

        this.results = split.tags.reduce((acc, tag, index) => {
            const data = response[index];
            if (!data) return acc;
            this.rawData.set(tag, data[1])
            acc.push([tag, data]);
            return acc;
        }, [] as Result[]);

        return true;
    }
}
