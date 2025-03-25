import { FallbackProvider, JsonRpcProvider, TransactionResponse, Wallet, WebSocketProvider } from 'ethers';
import { MulticallAbi } from '../abis';
import {
  DEFAULT_MULTICALL_MUTABLE_CALLS_STACK_LIMIT,
  DEFAULT_MULTICALL_STATIC_CALLS_STACK_LIMIT,
  DEFAULT_WAIT_CALLS_TIMEOUT_MS,
} from '../constant';
import { MULTICALL_ADDRESS } from '../constant';
import { Contract } from '../contract';
import { MULTICALL_ERRORS } from '../errors';
import { isStaticArray } from '../helpers';
import { CallMutability, MulticallOptions, MulticallResponse } from '../types';
import { ContractCall, MulticallTags, Tagable } from '../types';
import { checkSignals, raceWithSignals } from '../utils';
import { normalizeTags } from './multicall-normalize-tags';
import { multicallSplitCalls } from './multicall-split-calls';

export type Response = [success: boolean, rawData: string];
export interface PreparedData {
  call: ContractCall;
  rawData: string;
}

const aggregate3 = 'aggregate3';

export class MulticallContract extends Contract {
  protected _units: Map<Tagable, ContractCall> = new Map();
  protected _response: Response[] = [];
  protected _rawData: Map<Tagable, string> = new Map();
  protected _callsSuccess: Map<Tagable, boolean> = new Map();
  protected _lastSuccess: boolean | undefined;
  protected _isExecuting: boolean = false;
  protected _multicallOptions: MulticallOptions = {};

  constructor(
    driver: JsonRpcProvider | FallbackProvider | WebSocketProvider | Wallet,
    options: MulticallOptions = {},
    multicallAddress: string = MULTICALL_ADDRESS,
  ) {
    const contractOptions = {
      forceMutability: options.forceMutability,
      highPriorityTxs: options.highPriorityTxs,
      priorityOptions: options.priorityOptions,
      signals: options.signals,
      staticCallsTimeoutMs: options.staticCallsTimeoutMs,
      mutableCallsTimeoutMs: options.mutableCallsTimeoutMs,
    };

    super(MulticallAbi, multicallAddress, driver, contractOptions);

    this._multicallOptions = {
      maxStaticCallsStack: DEFAULT_MULTICALL_STATIC_CALLS_STACK_LIMIT,
      maxMutableCallsStack: DEFAULT_MULTICALL_MUTABLE_CALLS_STACK_LIMIT,
      waitForTxs: true, // The safest way to handle nonce in transactions
      waitCallsTimeoutMs: DEFAULT_WAIT_CALLS_TIMEOUT_MS,
      ...options,
    };
  }

  public clear() {
    this._units = new Map();
    this._response = [];
    this._rawData = new Map();
    this._callsSuccess = new Map();
    this._lastSuccess = undefined;
  }

  public add(tags: MulticallTags, contractCall: ContractCall): MulticallTags {
    this._units.set(normalizeTags(tags), contractCall);
    return tags;
  }

  public get tags(): Tagable[] {
    return Array.from(this._units.keys()); // The order is guaranteed
  }

  public get calls(): ContractCall[] {
    return Array.from(this._units.values()); // The order is guaranteed
  }

  public get response(): Response[] {
    return this._response;
  }

  public get success(): boolean | undefined {
    return this._lastSuccess;
  }

  public get static(): boolean {
    if (!this._units.size) return true;
    return isStaticArray(this.calls);
  }

  public get executing(): boolean {
    return this._isExecuting;
  }

  public isSuccess(tags: MulticallTags): boolean | undefined {
    return this._callsSuccess.get(normalizeTags(tags));
  }

  public getRaw(tags: MulticallTags): string | undefined {
    return this._rawData.get(normalizeTags(tags));
  }

  private getPreparedData(tags: MulticallTags): PreparedData | null {
    const nTags = normalizeTags(tags);
    const rawData = this._rawData.get(nTags);
    const call = this._units.get(nTags);
    if (!rawData || !call || !this.isSuccess(nTags)) return null;
    return {
      call,
      rawData,
    };
  }

  public getSingle<T>(tags: MulticallTags): T | undefined {
    const data = this.getPreparedData(normalizeTags(tags));
    if (!data) return undefined;
    const [value] = data.call.contractInterface.decodeFunctionResult(data.call.method, data.rawData);
    return value;
  }

  public getArray<T>(tags: MulticallTags, deep: boolean = false): T | undefined {
    const data = this.getPreparedData(normalizeTags(tags));
    if (!data) return undefined;
    const [array] = data.call.contractInterface.decodeFunctionResult(data.call.method, data.rawData).toArray(deep);
    return array;
  }

  private processResponse(response: Response[], tags: Tagable[]): boolean {
    // Process response of view-function (static)
    this._response = response;
    this._lastSuccess = true;
    response.forEach(([success, data]: [boolean, string], index: number) => {
      const tag = tags[index];
      if (!success) this._lastSuccess = false;
      this._rawData.set(tag!, data);
      this._callsSuccess.set(tag!, success);
    });
    return this._lastSuccess;
  }

  public async run(options: Partial<MulticallOptions> = {}): Promise<boolean> {
    const runOptions: MulticallOptions = {
      ...this._multicallOptions,
      ...options,
    };

    if (this._isExecuting) throw MULTICALL_ERRORS.SIMULTANEOUS_INVOCATIONS;
    try {
      this._isExecuting = true;
      this._lastSuccess = undefined;
      const tags = this.tags;
      const calls = this.calls;
      this._response = Array(tags.length).fill([undefined, null]);

      checkSignals(runOptions.signals);

      let staticCalls: ContractCall[] = [];
      let staticIndexes: number[] = [];
      let mutableCalls: ContractCall[] = [];
      let mutableIndexes: number[] = [];

      if (runOptions.forceMutability) {
        if (runOptions.forceMutability === CallMutability.Static) {
          staticCalls = calls;
          staticIndexes = Array.from({ length: calls.length }, (_, i) => i);
        } else {
          mutableCalls = calls;
          mutableIndexes = Array.from({ length: calls.length }, (_, i) => i);
        }
      } else {
        const split = multicallSplitCalls(calls);
        staticCalls = split.staticCalls;
        staticIndexes = split.staticIndexes;
        mutableCalls = split.mutableCalls;
        mutableIndexes = split.mutableIndexes;
      }

      // Process mutable
      for (let i = 0; i < mutableCalls.length; i += runOptions.maxMutableCallsStack!) {
        checkSignals(runOptions.signals);

        const border = Math.min(i + runOptions.maxMutableCallsStack!, mutableCalls.length);
        const iterationCalls = mutableCalls.slice(i, border);
        const iterationIndexes = mutableIndexes.slice(i, border);

        const iterationResponse = await this.processMutableCalls(iterationCalls, runOptions);

        this.saveResponse(iterationResponse, iterationIndexes, tags);
      }

      // Process static
      for (let i = 0; i < staticCalls.length; i += runOptions.maxStaticCallsStack!) {
        checkSignals(runOptions.signals);

        const border = Math.min(i + runOptions.maxStaticCallsStack!, staticCalls.length);
        const iterationCalls = staticCalls.slice(i, border);
        const iterationIndexes = staticIndexes.slice(i, border);

        const iterationResponse = (await this.processStaticCalls(iterationCalls, runOptions)) as MulticallResponse[];

        this.saveResponse(iterationResponse, iterationIndexes, tags);
      }
    } catch (error) {
      this._lastSuccess = false;
      throw error;
    } finally {
      this._isExecuting = false;
    }
    return this._lastSuccess ?? false;
  }

  private async processStaticCalls(iterationCalls: ContractCall[], runOptions: MulticallOptions) {
    const result = await this.call(aggregate3, [iterationCalls], {
      forceMutability: CallMutability.Static,
      signals: runOptions.signals,
      timeoutMs: runOptions.staticCallsTimeoutMs,
    });
    this._lastSuccess = !(this._lastSuccess === false);

    return result;
  }

  private async processMutableCalls(
    iterationCalls: ContractCall[],
    runOptions: MulticallOptions,
  ): Promise<MulticallResponse[]> {
    let result;
    const tx = (await this.call('aggregate3', [iterationCalls], {
      forceMutability: CallMutability.Mutable,
      highPriorityTx: runOptions.highPriorityTxs,
      priorityOptions: runOptions.priorityOptions,
      signals: runOptions.signals,
      timeoutMs: runOptions.mutableCallsTimeoutMs,
    })) as TransactionResponse;
    if (runOptions.waitForTxs) {
      const receipt = await raceWithSignals(() => tx.wait(), runOptions.signals);
      if (!receipt) {
        result = Array(iterationCalls.length).fill([false, null]);
        this._lastSuccess = false;
      } else {
        result = Array(iterationCalls.length).fill([true, receipt]);
        this._lastSuccess = !(this._lastSuccess === false);
      }
    } else {
      result = Array(iterationCalls.length).fill([true, tx]);
      this._lastSuccess = !(this._lastSuccess === false);
    }
    return result;
  }

  private saveResponse(
    iterationResponse: MulticallResponse[],
    iterationIndexes: number[],
    globalTags: Tagable[],
  ): void {
    iterationResponse.forEach((el, index) => {
      const [success, data] = el;
      const globalIndex = iterationIndexes[index];
      const tag = globalTags[globalIndex!]; // Normalized
      if (!success) this._lastSuccess = false;
      if (typeof data === 'string') {
        this._rawData.set(tag!, data);
      }
      if (success) {
        this._callsSuccess.set(tag!, success);
      }
      if (success !== undefined) {
        this._response[globalIndex!] = el as Response;
      }
    });
  }
}
