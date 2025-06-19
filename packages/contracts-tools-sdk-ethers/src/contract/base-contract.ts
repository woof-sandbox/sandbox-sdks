import {
  Contract as EthersContract,
  type FunctionFragment,
  type Interface,
  type InterfaceAbi,
  type Listener,
  type Provider,
  type Signer,
  WebSocketProvider,
} from "ethers";
import { config } from "../config";
import { CONTRACTS_ERRORS } from "../errors";
import {
  isSigner,
  isStaticMethod,
  priorityCall,
  priorityCallEstimate,
} from "../helpers";
import {
  CallMutability,
  type ContractCall,
  type ContractCallOptions,
  type ContractGetLogsOptions,
  type ContractLog,
  type ContractOptions,
  type DynamicContractConstructor,
  type StateMutability,
} from "../types";
import {
  checkSignals,
  createTimeoutSignal,
  raceWithSignals,
  waitWithSignals,
} from "../utils";
import { contractCreateCallName } from "./contract-create-call-name";

export class BaseContract {
  readonly address: string;
  readonly driver?: Signer | Provider;
  readonly isCallable: boolean;
  readonly isReadonly: boolean;
  readonly contract: EthersContract;
  readonly contractOptions: ContractOptions = {};

  static createAutoClass(
    abi: Interface | InterfaceAbi,
    address?: string,
    driver?: Provider | Signer,
    options?: ContractOptions,
  ) {
    return class extends this {
      constructor(args: any) {
        super(
          args?.abi || abi,
          args?.address || address,
          args?.driver || driver,
          args?.options || options,
        );

        for (const fragment of Object.values(this.interface.fragments)) {
          if (fragment.type === "function") {
            const funcFragment = fragment as FunctionFragment;
            const name = funcFragment.name;

            if (!(name in this)) {
              Object.defineProperty(this, name, {
                value: async (args: any[] = [], options?: any) =>
                  this.call(name, args, options),
                writable: true,
                enumerable: true,
              });
            }

            const getCallName = contractCreateCallName(name);
            if (!(getCallName in this)) {
              Object.defineProperty(this, getCallName, {
                value: (args: any[] = [], callData: any = {}) =>
                  this.getCall(name, args, callData),
                writable: true,
                enumerable: true,
              });
            }
          }
        }
      }
    } as unknown as DynamicContractConstructor;
  }

  static createAutoInstance(
    abi: Interface | InterfaceAbi,
    address?: string,
    driver?: Provider | Signer,
    options?: ContractOptions,
  ) {
    const AutoClass = this.createAutoClass(abi, address, driver, options);
    return new AutoClass({ abi, address, driver, options });
  }

  constructor(
    abi: Interface | InterfaceAbi,
    address = "0x0000000000000000000000000000000000000000",
    driver: Signer | Provider,
    options: ContractOptions = {},
  ) {
    this.address = address;
    this.driver = driver;
    this.isCallable = !!address && !!driver;
    this.isReadonly = !this.isCallable || !isSigner(driver);
    this.contract = new EthersContract(address, abi, driver);
    this.contractOptions = {
      staticCallsTimeoutMs: config.contract.staticCalls.timeoutMs,
      mutableCallsTimeoutMs: config.contract.mutableCalls.timeoutMs,
      ...options,
    };
  }

  public get provider(): Provider | null {
    if (!this.driver) return null;
    return this.driver.provider;
  }

  public get signer(): Signer | null {
    if (isSigner(this.driver as Signer)) return this.driver as Signer;
    return null;
  }

  public get interface(): Interface {
    return this.contract.interface;
  }

  public async call<T>(
    method: string,
    args: any[] = [],
    options: ContractCallOptions = {},
  ): Promise<Awaited<T>> {
    if (!this.isCallable)
      throw CONTRACTS_ERRORS.NON_CALLABLE_CONTRACT_INVOCATION;
    const methodFn = this.contract[method];

    if (!methodFn) throw CONTRACTS_ERRORS.METHOD_NOT_DEFINED(method);

    const functionFragment = this.contract.interface.getFunction(method);
    if (!functionFragment) throw CONTRACTS_ERRORS.FRAGMENT_NOT_DEFINED(method);

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
    if (callOptions.timeoutMs)
      localSignals.push(this.getTimeoutSignal(isStatic, callOptions.timeoutMs));

    if (isStatic) {
      return raceWithSignals(() => methodFn.staticCall(...args), localSignals);
    } else {
      if (this.isReadonly) throw CONTRACTS_ERRORS.READ_ONLY_CONTRACT_MUTATION;

      let tx;
      if (callOptions.highPriorityTx) {
        const provider = this.driver?.provider;
        tx = await raceWithSignals(
          () =>
            priorityCall(
              provider as Provider,
              this.driver as Signer,
              this.contract,
              method,
              args,
              {
                signals: localSignals,
                ...options.priorityOptions,
              },
            ),
          localSignals,
        );
      } else {
        tx = await raceWithSignals(() => methodFn(...args), localSignals);
      }

      return tx;
    }
  }

  async estimate(
    method: string,
    args: any[] = [],
    options: ContractCallOptions = {},
  ) {
    if (!this.isCallable)
      throw CONTRACTS_ERRORS.NON_CALLABLE_CONTRACT_INVOCATION;
    const methodFn = this.contract[method];

    if (!methodFn) throw CONTRACTS_ERRORS.METHOD_NOT_DEFINED(method);

    const functionFragment = this.contract.interface.getFunction(method);
    if (!functionFragment) throw CONTRACTS_ERRORS.FRAGMENT_NOT_DEFINED(method);

    if (isStaticMethod(functionFragment.stateMutability))
      throw CONTRACTS_ERRORS.ESTIMATE_STATIC_CALL(method);

    const callOptions = {
      highPriorityTx: this.contractOptions.highPriorityTxs,
      priorityOptions: this.contractOptions.priorityOptions,
      ...options,
    };

    const localSignals: AbortSignal[] = [];
    if (callOptions.signals) localSignals.push(...callOptions.signals);
    if (callOptions.timeoutMs)
      localSignals.push(this.getTimeoutSignal(false, callOptions.timeoutMs));

    if (this.isReadonly) throw CONTRACTS_ERRORS.READ_ONLY_CONTRACT_MUTATION;
    let estimate;
    if (callOptions.highPriorityTx) {
      const provider = this.driver?.provider;
      estimate = await raceWithSignals(
        () =>
          priorityCallEstimate(
            provider as Provider,
            this.driver as Signer,
            this.contract,
            method,
            args,
            {
              signals: localSignals,
              ...options.priorityOptions,
            },
          ),
        localSignals,
      );
    } else {
      estimate = await raceWithSignals(
        () => this.contract[method]!.estimateGas(...args),
        localSignals,
      );
    }
    return estimate;
  }

  public getCall(
    methodName: string,
    args: any[] = [],
    callData = {},
  ): ContractCall {
    if (!this.address) throw CONTRACTS_ERRORS.NON_CALLABLE_CONTRACT_INVOCATION;

    const functionFragment = this.interface.getFunction(methodName);
    if (!functionFragment)
      throw CONTRACTS_ERRORS.FRAGMENT_NOT_DEFINED(methodName);

    return {
      method: methodName,
      target: this.address,
      allowFailure: config.multicallUnit.allowFailure,
      callData: this.interface.encodeFunctionData(methodName, args),
      stateMutability: functionFragment.stateMutability as StateMutability,
      contractInterface: this.interface,
      ...callData,
    };
  }

  public async listenEvent(
    eventName: string,
    listener: Listener,
  ): Promise<EthersContract> {
    if (!this.isCallable)
      throw CONTRACTS_ERRORS.NON_CALLABLE_CONTRACT_INVOCATION;
    if (!(this.provider instanceof WebSocketProvider))
      throw CONTRACTS_ERRORS.MISSING_WEBSOCKET_PROVIDER;

    return this.contract.on(eventName, listener);
  }

  public async getLogs(
    fromBlock: number,
    eventsNames: string[] = [],
    toBlock = 0,
    options: ContractGetLogsOptions = {},
  ): Promise<ContractLog[]> {
    const descriptions = [];
    for await (const description of this.getLogsStream(
      fromBlock,
      eventsNames,
      toBlock,
      options,
    )) {
      descriptions.push(description);
    }

    return descriptions;
  }

  public async *getLogsStream(
    fromBlock: number,
    eventsNames: string[] = [],
    toBlock = 0, // Latest by default
    options: ContractGetLogsOptions = {},
  ): AsyncGenerator<ContractLog, void> {
    if (!this.isCallable)
      throw CONTRACTS_ERRORS.NON_CALLABLE_CONTRACT_INVOCATION;

    const streamOptions = {
      blocksStep:
        this.contractOptions.logsBlocksStep ||
        config.contract.logsGathering.blocksStep,
      delayMs:
        this.contractOptions.logsDelayMs ||
        config.contract.logsGathering.delayMs,
      ...options,
    };

    const topics = eventsNames.map(
      (event) => this.contract.getEvent(event).fragment.topicHash,
    );

    checkSignals(options.signals);
    const finToBlock = toBlock
      ? toBlock
      : await this.provider!.getBlockNumber();
    const finFromBlock = fromBlock < 0 ? finToBlock + fromBlock : fromBlock;

    for (
      let from = finFromBlock;
      from < finToBlock;
      from += streamOptions.blocksStep
    ) {
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
        yield {
          log,
          description,
        };
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
