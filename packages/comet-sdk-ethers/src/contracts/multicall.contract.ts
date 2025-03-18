import type {JsonRpcProvider, Provider, Signer, Wallet, WebSocketProvider} from "ethers";
import { MulticallAbi } from "../abis";
import { MULTICALL_ADDRESS } from "../constants";
import { CONTRACTS_ERRORS } from "../errors/contracts";
import { MULTICALL_ERRORS } from "../errors/multicall";
import { BaseContract } from "./base-contract";
import type { ContractCall } from "./entities";
import { isStaticMethod } from "./helpers";

type Tag = string;
type Response = [success: boolean, rawData: string];
interface PreparedData {
  call: ContractCall;
  rawData: string;
}

export class MulticallContract extends BaseContract {
  _units: Map<Tag, ContractCall> = new Map();
  _response: Response[] = [];
  _rawData: Map<Tag, string> = new Map();
  _callsSuccess: Map<Tag, boolean> = new Map();
  _lastSuccess?: boolean;

  constructor(driver: Provider | Signer) {
    super(MulticallAbi, MULTICALL_ADDRESS, driver);
  }

  public clear() {
    this._units = new Map();
    this._response = [];
    this._rawData = new Map();
    this._callsSuccess = new Map();
    this._lastSuccess = undefined;
  }

  public add(tag: Tag, contractCall: ContractCall): string {
    this._units.set(tag, contractCall);
    return tag;
  }

  get tags(): Tag[] {
    return Array.from(this._units.keys());
  }
  get calls(): ContractCall[] {
    return Array.from(this._units.values());
  }

  get response(): Response[] {
    return this._response;
  }
  get success(): boolean | undefined {
    return this._lastSuccess;
  }
  get static(): boolean {
    return !this.calls.some((call) => !isStaticMethod(call.stateMutability));
  }

  public getRaw(tag: string): string | undefined {
    return this._rawData.get(tag);
  }
  public isSuccess(tag: Tag): boolean | undefined {
    return this._callsSuccess.get(tag);
  }

  private getPreparedData(tag: Tag): PreparedData | null {
    const rawData = this._rawData.get(tag);
    const call = this._units.get(tag);
    if (!rawData || !call || !this.isSuccess(tag)) return null;
    return {
      call,
      rawData,
    };
  }

  public getSingle<T>(tag: Tag): T | undefined {
    const data = this.getPreparedData(tag);
    if (!data) return;
    return data.call.contractInterface.decodeFunctionResult(
      data.call.method,
      data.rawData,
    )[0] as T;
  }

  public getArray<T>(tag: Tag): T | undefined {
    const data = this.getPreparedData(tag);
    if (!data) return;
    return Object.values(
      data.call.contractInterface.decodeFunctionResult(
        data.call.method,
        data.rawData,
      )[0],
    ) as T;
  }

  public async run(): Promise<boolean> {
    if (!this.contract.aggregate3) {
      throw CONTRACTS_ERRORS.METHOD_NOT_FOUND("aggregate3");
    }

    const tags = this.tags;
    const calls = this.calls;

    let response: Response[];
    if (this.static) {
      response = await this.contract.aggregate3.staticCall(calls);
    } else {
      if (this.isReadonly) throw CONTRACTS_ERRORS.TRY_TO_CALL_READ_ONLY;
      response = await this.contract.aggregate3(calls);
    }

    this._response = response;
    this._lastSuccess = true;
    response.forEach(([success, data], index) => {
      const tag = tags[index];
      if (!tag) throw MULTICALL_ERRORS.TAG_NOT_FOUND;
      if (!success) this._lastSuccess = false;
      this._rawData.set(tag, data);
      this._callsSuccess.set(tag, success);
    });
    return this._lastSuccess;
  }
}
