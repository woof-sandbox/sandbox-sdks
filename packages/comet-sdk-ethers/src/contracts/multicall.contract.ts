import type {
  Interface,
  JsonRpcProvider,
  Wallet,
  WebSocketProvider,
} from "ethers";
import { MulticallAbi } from "../abis";
import { MULTICALL_ADDRESS } from "../constants";
import { CONTRACTS_ERRORS } from "../errors/contracts";
import { BaseContract } from "./base-contract";
import type { ContractCall } from "./entities";
import { isStaticMethod } from "./helpers";

interface SplitData {
  tags: string[];
  calls: ContractCall[];
}
type Unit = [string, ContractCall];
type Result = [string, unknown];

type Response = [success: boolean, rawData: string];
const isSuccess = (responses: Response[]) => responses.every((el) => el[0]);

export class MulticallContract extends BaseContract {
  private units: Unit[] = [];
  private results: Result[] = [];
  private rawData: Map<string, string> = new Map();
  private lastSuccess?: boolean;

  constructor(driver: JsonRpcProvider | WebSocketProvider | Wallet) {
    super(MulticallAbi, MULTICALL_ADDRESS, driver);
  }

  add(tag: string, contractCall: ContractCall): string {
    this.units.push([tag, contractCall]);
    return tag;
  }

  get rawResults(): Result[] {
    return this.results;
  }
  get success(): boolean | undefined {
    return this.lastSuccess;
  }
  get static(): boolean {
    return !this.units.some((unit) => !isStaticMethod(unit[1].stateMutability));
  }

  getRaw(tag: string): string | undefined {
    return this.rawData.get(tag);
  }

  getSingle<T>(
    tag: string,
    methodName: string,
    contractInterface: Interface,
  ): T | undefined {
    const raw = this.rawData.get(tag);
    if (!raw) return;
    return contractInterface.decodeFunctionResult(methodName, raw)[0] as T;
  }

  async run(): Promise<boolean> {
    const split = this.units.reduce(
      (acc, [tag, call]) => {
        acc.tags.push(tag);
        acc.calls.push(call);
        return acc;
      },
      {
        tags: [],
        calls: [],
      } as SplitData,
    );

    if (!this.contract.aggregate3)
      throw CONTRACTS_ERRORS.METHOD_NOT_FOUND("aggregate3");
    let response: Response[];

    if (this.static) {
      response = await this.contract.aggregate3.staticCall(split.calls);
    } else {
      if (this.isReadonly) throw CONTRACTS_ERRORS.TRY_TO_CALL_READ_ONLY;
      response = await this.contract.aggregate3(split.calls);
    }
    this.results = split.tags.reduce((acc, tag, index) => {
      const data = response[index];
      if (!data) return acc;
      this.rawData.set(tag, data[1]);
      acc.push([tag, data]);
      return acc;
    }, [] as Result[]);

    this.lastSuccess = isSuccess(response);
    return this.lastSuccess;
  }
}
