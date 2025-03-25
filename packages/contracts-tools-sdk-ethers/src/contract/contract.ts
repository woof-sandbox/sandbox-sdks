import {
  Contract as EthersContract,
  FallbackProvider,
  Interface,
  InterfaceAbi,
  JsonRpcProvider,
  Listener,
  LogDescription,
  Provider,
  Signer,
  Wallet,
  WebSocketProvider,
} from 'ethers';
import {
  DEFAULT_LOGS_BLOCKS_STEP,
  DEFAULT_LOGS_DELAY_MS,
  DEFAULT_MULTICALL_ALLOW_FAILURE,
  DEFAULT_MUTABLE_CALLS_TIMEOUT_MS,
  DEFAULT_STATIC_CALLS_TIMEOUT_MS,
} from '../constant.js';
import { CONTRACTS_ERRORS } from '../errors';
import { isStaticMethod } from '../helpers';
import { ContractCall, StateMutability } from '../types';
import { CallMutability, ContractCallOptions, ContractGetLogsOptions, ContractOptions } from '../types';
import { checkSignals, createTimeoutSignal, priorityCall, raceWithSignals, waitWithSignals } from '../utils';

export class Contract {
  readonly address: string;
  readonly driver: JsonRpcProvider | FallbackProvider | WebSocketProvider | Wallet | undefined;
  readonly isCallable: boolean;
  readonly isReadonly: boolean;
  readonly contract: EthersContract;
  readonly contractOptions: ContractOptions = {};

  constructor(
    abi: Interface | InterfaceAbi,
    address: string = '0x0000000000000000000000000000000000000000',
    driver: JsonRpcProvider | FallbackProvider | WebSocketProvider | Wallet | undefined,
    options: ContractOptions = {},
  ) {
    this.address = address;
    this.driver = driver;
    this.isCallable = !!address && !!driver;
    this.isReadonly = !this.isCallable || !(driver instanceof Wallet);
    this.contract = new EthersContract(address, abi, driver);
    this.contractOptions = {
      staticCallsTimeoutMs: DEFAULT_STATIC_CALLS_TIMEOUT_MS,
      mutableCallsTimeoutMs: DEFAULT_MUTABLE_CALLS_TIMEOUT_MS,
      ...options,
    };
  }

  public get provider(): JsonRpcProvider | FallbackProvider | WebSocketProvider | undefined {
    if (!this.driver) return undefined;
    if (this.driver instanceof Wallet) return this.driver.provider as FallbackProvider | WebSocketProvider;
    return this.driver;
  }

  public get signer(): Wallet | undefined {
    if (this.driver instanceof Wallet) return this.driver;
    return undefined;
  }

  public get interface(): Interface {
    return this.contract.interface;
  }

  public async call<T>(methodName: string, args: any[] = [], options: ContractCallOptions = {}): Promise<Awaited<T>> {
    if (!this.isCallable) throw CONTRACTS_ERRORS.NON_CALLABLE_CONTRACT_INVOCATION;
    const method = this.contract[methodName];

    if (!method) throw CONTRACTS_ERRORS.METHOD_NOT_DEFINED(methodName);

    const functionFragment = this.contract.interface.getFunction(methodName);
    if (!functionFragment) throw CONTRACTS_ERRORS.FRAGMENT_NOT_DEFINED(methodName);

    const callOptions = {
      forceMutability: this.contractOptions.forceMutability,
      highPriorityTx: this.contractOptions.highPriorityTxs,
      priorityOptions: this.contractOptions.priorityOptions,
      ...options,
    };

    const isStatic = callOptions.forceMutability
      ? callOptions.forceMutability === CallMutability.Static
      : isStaticMethod(functionFragment.stateMutability);

    const localSignals: AbortSignal[] = [];
    if (callOptions.signals) localSignals.push(...callOptions.signals);
    if (callOptions.timeoutMs) localSignals.push(this.getTimeoutSignal(isStatic, callOptions.timeoutMs));

    if (isStatic) {
      return raceWithSignals(() => method.staticCall(...args), localSignals);
    } else {
      if (this.isReadonly) throw CONTRACTS_ERRORS.READ_ONLY_CONTRACT_MUTATION;

      let tx;
      if (callOptions.highPriorityTx) {
        const provider = this.driver?.provider;
        tx = await raceWithSignals(
          () =>
            priorityCall(provider as Provider, this.driver as Signer, this.contract, methodName, args, {
              signals: localSignals,
              ...options.priorityOptions,
            }),
          localSignals,
        );
      } else {
        tx = await raceWithSignals(() => method(...args), localSignals);
      }

      return tx;
    }
  }

  public getCall(methodName: string, args: any[] = [], callData = {}): ContractCall {
    if (!this.address) throw CONTRACTS_ERRORS.NON_CALLABLE_CONTRACT_INVOCATION;

    const functionFragment = this.interface.getFunction(methodName);
    if (!functionFragment) throw CONTRACTS_ERRORS.FRAGMENT_NOT_DEFINED(methodName);

    return {
      method: methodName,
      target: this.address,
      allowFailure: DEFAULT_MULTICALL_ALLOW_FAILURE,
      callData: this.interface.encodeFunctionData(methodName, args),
      stateMutability: functionFragment.stateMutability as StateMutability,
      contractInterface: this.interface,
      ...callData,
    };
  }

  public async listenEvent(eventName: string, listener: Listener) {
    if (!this.isCallable) throw CONTRACTS_ERRORS.NON_CALLABLE_CONTRACT_INVOCATION;
    if (!(this.provider instanceof WebSocketProvider)) throw CONTRACTS_ERRORS.MISSING_WEBSOCKET_PROVIDER;

    return this.contract.on(eventName, listener);
  }

  public async getLogs(
    fromBlock: number,
    eventsNames: string[] = [],
    toBlock: number = 0,
    options: ContractGetLogsOptions = {},
  ) {
    const descriptions = [];
    for await (const description of this.getLogsStream(fromBlock, eventsNames, toBlock, options)) {
      descriptions.push(description);
    }

    return descriptions;
  }

  public async *getLogsStream(
    fromBlock: number,
    eventsNames: string[] = [],
    toBlock: number = 0, // Latest by default
    options: ContractGetLogsOptions = {},
  ): AsyncGenerator<LogDescription, void> {
    if (!this.isCallable) throw CONTRACTS_ERRORS.NON_CALLABLE_CONTRACT_INVOCATION;

    const streamOptions = {
      blocksStep: this.contractOptions.logsBlocksStep || DEFAULT_LOGS_BLOCKS_STEP,
      delayMs: this.contractOptions.logsDelayMs || DEFAULT_LOGS_DELAY_MS,
      ...options,
    };

    const topics = eventsNames.map((event) => this.contract.getEvent(event).fragment.topicHash);

    checkSignals(options.signals);
    const finToBlock = toBlock ? toBlock : await this.provider!.getBlockNumber();
    const finFromBlock = fromBlock < 0 ? finToBlock + fromBlock : fromBlock;

    for (let from = finFromBlock; from < finToBlock; from += streamOptions.blocksStep) {
      checkSignals(options.signals);

      const to = Math.min(from + streamOptions.blocksStep, finToBlock);
      const localLogs = await this.provider!.getLogs({
        fromBlock: from,
        toBlock: to,
        address: this.address,
        topics: topics.length ? [topics] : undefined,
      });

      for (const log of localLogs) {
        checkSignals(options.signals);
        const description = this.interface.parseLog(log);
        if (!description) continue;
        yield description;
      }

      await waitWithSignals(streamOptions.delayMs, options.signals);
    }
  }

  private getTimeoutSignal(isStatic: boolean, timeoutMs: number): AbortSignal {
    let timeout;
    if (timeoutMs) {
      timeout = timeoutMs;
    } else {
      if (isStatic) {
        timeout = this.contractOptions.staticCallsTimeoutMs;
      } else {
        timeout = this.contractOptions.mutableCallsTimeoutMs;
      }
    }
    return createTimeoutSignal(timeout!);
  }
}
