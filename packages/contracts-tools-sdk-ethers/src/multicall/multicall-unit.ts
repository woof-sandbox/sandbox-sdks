import { EventEmitter } from "node:events";
import type { Provider, Signer, TransactionResponse } from "ethers";
import { MulticallAbi } from "../abis";
import { config } from "../config";
import { MULTICALL_ADDRESS } from "../constant";
import { BaseContract } from "../contract";
import { MULTICALL_ERRORS } from "../errors";
import { isParsable, isStaticArray } from "../helpers";
import {
  CallMutability,
  type ContractCall,
  type MulticallDecodableData,
  type MulticallOptions,
  type MulticallResponse,
  type MulticallTags,
  type MulticallWaitOptions,
  type Tagable,
} from "../types";
import {
  checkSignals,
  createTimeoutSignal,
  raceWithSignals,
  waitWithSignals,
} from "../utils";
import { multicallErrorEventName } from "./multicall-error-event-name";
import { multicallNormalizeTags } from "./multicall-normalize-tags";
import { multicallResultEventName } from "./multicall-result-event-name";
import { multicallSplitCalls } from "./multicall-split-calls";

export type Response = [success: boolean, rawData: string];

const aggregate3 = "aggregate3";

export class MulticallUnit extends BaseContract {
  protected _units: Map<Tagable, ContractCall> = new Map();
  protected _response: Response[] = [];
  protected _rawData: Map<Tagable, string> = new Map();
  protected _callsSuccess: Map<Tagable, boolean> = new Map();
  protected _lastSuccess: boolean | undefined;
  protected _isExecuting = false;
  protected _emitter = new EventEmitter();
  protected _multicallOptions: MulticallOptions = {};
  protected _txResponses = new Map();
  protected _txReceipts = new Map();

  constructor(
    driver: Signer | Provider,
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
      maxStaticCallsStack: config.multicallUnit.staticCalls.batchLimit,
      maxMutableCallsStack: config.multicallUnit.mutableCalls.batchLimit,
      waitForTxs: config.multicallUnit.waitForTxs,
      waitCallsTimeoutMs: config.multicallUnit.waitCalls.timeoutMs,
      batchDelayMs: config.multicallUnit.batchDelayMs,
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
    this._units.set(multicallNormalizeTags(tags), contractCall);
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
    return this._callsSuccess.get(multicallNormalizeTags(tags));
  }

  public getRaw(tags: MulticallTags): string | null {
    return this._rawData.get(multicallNormalizeTags(tags)) ?? null;
  }

  public getSingle<T>(tags: MulticallTags): T | null {
    const data = this.getDecodableData(tags);
    if (!data) return null;
    const [value] = data.call.contractInterface!.decodeFunctionResult(
      data.call.method!,
      data.rawData,
    );
    return value;
  }

  public getArray<T>(tags: MulticallTags, deep = false): T | null {
    const data = this.getDecodableData(tags);
    if (data === null) return null;
    return data.call
      .contractInterface!.decodeFunctionResult(data.call.method!, data.rawData)
      .toArray(deep) as T;
  }

  public async run(options: Partial<MulticallOptions> = {}): Promise<boolean> {
    const runOptions: MulticallOptions = {
      ...this._multicallOptions,
      ...options,
    };

    if (this._isExecuting) throw MULTICALL_ERRORS.SIMULTANEOUS_INVOCATIONS;

    this._isExecuting = true;
    this._lastSuccess = undefined;
    const tags = this.tags;
    const calls = this.calls;
    this._response = Array(tags.length).fill([undefined, null]);

    try {
      checkSignals(runOptions.signals);

      let staticCalls: typeof calls;
      let staticIndexes: number[];
      let mutableCalls: typeof calls;
      let mutableTags: typeof tags;
      let mutableIndexes: number[];

      if (runOptions.forceMutability) {
        if (runOptions.forceMutability === CallMutability.Static) {
          staticCalls = calls;
          staticIndexes = Array.from({ length: calls.length }, (_, i) => i);
          mutableCalls = [];
          mutableTags = [];
          mutableIndexes = [];
        } else {
          staticCalls = [];
          staticIndexes = [];
          mutableCalls = calls;
          mutableTags = tags;
          mutableIndexes = Array.from({ length: calls.length }, (_, i) => i);
        }
      } else {
        const split = multicallSplitCalls(calls, tags);
        staticCalls = split.staticCalls;
        staticIndexes = split.staticIndexes;
        mutableCalls = split.mutableCalls;
        mutableTags = split.mutableTags;
        mutableIndexes = split.mutableIndexes;
      }

      // Process mutable
      for (
        let i = 0;
        i < mutableCalls.length;
        i += runOptions.maxMutableCallsStack!
      ) {
        checkSignals(runOptions.signals);

        const border = Math.min(
          i + runOptions.maxMutableCallsStack!,
          mutableCalls.length,
        );
        const iterationCalls = mutableCalls.slice(i, border); // half-opened interval
        const iterationTags = mutableTags.slice(i, border);
        const iterationIndexes = mutableIndexes.slice(i, border); // half-opened interval

        const iterationResponse = await this.processMutableCalls(
          iterationCalls,
          iterationTags,
          runOptions,
        );

        this.saveResponse(iterationResponse, iterationIndexes, tags);
        await waitWithSignals(runOptions.batchDelayMs!, runOptions.signals);
      }

      // Process static
      for (
        let i = 0;
        i < staticCalls.length;
        i += runOptions.maxStaticCallsStack!
      ) {
        checkSignals(runOptions.signals);

        const border = Math.min(
          i + runOptions.maxStaticCallsStack!,
          staticCalls.length,
        );
        const iterationCalls = staticCalls.slice(i, border); // half-opened interval
        const iterationIndexes = staticIndexes.slice(i, border); // half-opened interval

        const iterationResponse = await this.processStaticCalls(
          iterationCalls,
          runOptions,
        );

        this.saveResponse(iterationResponse, iterationIndexes, tags);
        await waitWithSignals(runOptions.batchDelayMs!, runOptions.signals);
      }
    } catch (error) {
      this._lastSuccess = false;
      tags.forEach((tag) =>
        this._emitter.emit(multicallErrorEventName(tag), error),
      ); // For unlock all the waiters
      throw error;
    } finally {
      this._isExecuting = false;
    }
    return this._lastSuccess ?? false;
  }

  private async processStaticCalls(
    iterationCalls: ContractCall[],
    runOptions: MulticallOptions,
  ): Promise<MulticallResponse[]> {
    const result = await this.call(aggregate3, [iterationCalls], {
      forceMutability: CallMutability.Static,
      signals: runOptions.signals,
      timeoutMs: runOptions.staticCallsTimeoutMs,
    });
    this._lastSuccess = !(this._lastSuccess === false);

    return result as MulticallResponse[];
  }

  private async processMutableCalls(
    iterationCalls: ContractCall[],
    iterationTags: Tagable[],
    runOptions: MulticallOptions,
  ): Promise<MulticallResponse[]> {
    let result;
    const tx = (await this.call(aggregate3, [iterationCalls], {
      forceMutability: CallMutability.Mutable,
      highPriorityTx: runOptions.highPriorityTxs,
      priorityOptions: runOptions.priorityOptions,
      signals: runOptions.signals,
      timeoutMs: runOptions.mutableCallsTimeoutMs,
    })) as TransactionResponse;
    iterationTags.forEach((tag) => this._txResponses.set(tag, tx));
    if (runOptions.waitForTxs) {
      const receipt = await raceWithSignals(
        () => tx.wait(),
        runOptions.signals,
      );
      if (!receipt) {
        result = Array(iterationCalls.length).fill([false, null]);
        this._lastSuccess = false;
      } else {
        result = Array(iterationCalls.length).fill([true, receipt]);
        this._lastSuccess = !(this._lastSuccess === false);
        iterationTags.forEach((tag) => this._txReceipts.set(tag, receipt));
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
      const globalIndex: number = iterationIndexes[index]!;
      const tag: Tagable = globalTags[globalIndex]!; // Normalized
      if (!success) this._lastSuccess = false;
      if (typeof data === "string") this._rawData.set(tag, data);
      this._callsSuccess.set(tag, success!);
      this._response[globalIndex] = el as Response;
      this._emitter.emit(multicallResultEventName(tag));
    });
  }

  getOrThrow<T>(tags: MulticallTags, deep = false): T {
    const value: T | null = this.get(tags, deep);
    if (value === null) throw MULTICALL_ERRORS.RESULT_NOT_FOUND;
    return value;
  }

  public get<T>(tags: MulticallTags, deep = false): T | null {
    const raw = this.getRaw(tags);
    if (raw === null) return null;
    // if (typeof raw !== 'string') return raw; // Transaction or Receipt for mutable call

    const data = this.getDecodableData(tags);
    if (!data) return null;

    const decoded = data.call.contractInterface!.decodeFunctionResult(
      data.call.method!,
      data.rawData,
    );
    const outputs = data.call.contractInterface!.getFunction(
      data.call.method!,
    )!.outputs;

    if (!outputs || outputs.length === 0) {
      return null;
    }

    // Only one output - returns just single (sometimes can work with arrays (like [address[]]))
    if (outputs.length === 1) {
      return decoded[0];
    }

    // Outputs are named in ABI - object can be formed
    // If output is named - object is preferable
    if (outputs.every((param) => !!param.name)) {
      return decoded.toObject(deep) as T;
    }

    // In other case - return array
    return decoded.toArray(deep) as T;
  }

  private getDecodableData(tags: MulticallTags): MulticallDecodableData | null {
    const nTags = multicallNormalizeTags(tags);
    const rawData = this._rawData.get(nTags);
    const call = this._units.get(nTags);

    if (
      rawData === undefined ||
      !call ||
      !isParsable(call) ||
      !this.isSuccess(nTags)
    ) {
      return null;
    }

    return {
      call,
      rawData,
    };
  }

  public async waitRawOrThrow(
    tags: MulticallTags,
    options?: MulticallWaitOptions,
  ): Promise<string> {
    const raw = await this.waitRaw(tags, options);
    if (raw === null) throw MULTICALL_ERRORS.RESULT_NOT_FOUND;
    return raw;
  }

  public async waitRaw(
    tags: MulticallTags,
    options?: MulticallWaitOptions,
  ): Promise<string | null> {
    const nTags = multicallNormalizeTags(tags);
    // 1. If result exists - just return
    {
      const result = this._rawData.get(nTags);
      if (result) return result;
    }
    if (this._txResponses.has(nTags)) {
      return null;
    }

    // 2. Or wait for event
    await this.wait(tags, options);
    return this.getRaw(nTags);
  }

  public wait(
    tags: MulticallTags,
    options?: MulticallWaitOptions,
  ): Promise<void> {
    const signals = options?.signals ?? [];
    if (options?.timeoutMs)
      signals.push(createTimeoutSignal(options.timeoutMs));

    const nTags = multicallNormalizeTags(tags);
    return raceWithSignals(
      () =>
        new Promise((resolve, reject) => {
          const resultEvent = multicallResultEventName(nTags);
          const errorEvent = multicallErrorEventName(nTags);

          const onResult = () => {
            cleanup();
            resolve();
          };
          const onError = (error: Error) => {
            cleanup();
            reject(error);
          };

          const cleanup = () => {
            this._emitter.removeListener(resultEvent, onResult);
            this._emitter.removeListener(errorEvent, onError);
          };

          this._emitter.once(resultEvent, onResult);
          this._emitter.once(errorEvent, onError);
        }),
      signals,
    );
  }

  public async waitTxOrThrow(
    tags: MulticallTags,
    options?: MulticallWaitOptions,
  ): Promise<TransactionResponse> {
    const tx = await this.waitTx(tags, options);
    if (tx === null) throw MULTICALL_ERRORS.RESULT_NOT_FOUND;
    return tx;
  }

  async waitTx(
    tags: MulticallTags,
    options?: MulticallWaitOptions,
  ): Promise<TransactionResponse | null> {
    const nTags = multicallNormalizeTags(tags);
    // 1. If result exists - just return
    {
      const result = this._txResponses.get(nTags);
      if (result) return result;
    }
    if (this._rawData.has(nTags)) {
      return null;
    }

    // 2. Or wait for event
    await this.wait(tags, options);
    return this.getTxResponse(nTags);
  }

  getTxResponse(tags: MulticallTags): TransactionResponse | null {
    return this._txResponses.get(multicallNormalizeTags(tags)) ?? null;
  }
}
