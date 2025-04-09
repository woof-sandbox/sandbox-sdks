import type {
  Contract as EthersContract,
  Interface,
  InterfaceAbi,
  Listener,
  LogDescription,
  Provider,
  Signer,
} from "ethers";
import type {
  ContractCall,
  ContractCallOptions,
  ContractGetLogsOptions,
  ContractOptions,
} from "./";
import type { DynamicContract } from "./dynamic-contract";
import type { DynamicContractConstructor } from "./dynamic-contract-constructor";

/**
 * Base wrapper around ethers.js BaseContract with built-in ContractCall (multicall) support,
 * signal-based timeouts/aborts, dynamic mutability detection, and event/log streaming.
 */
export declare class BaseContract {
  /**
   * Creates a subclass of the base `BaseContract` class, where all ABI-defined methods
   * are automatically added as instance methods and `get<MethodName>Call()` accessors
   * for use in multicall contexts.
   *
   * Each method from the ABI becomes available as:
   * - `contract.methodName(args[], options?)` — for invoking the method
   * - `contract.getMethodNameCall(args[], callData?)` — for generating a low-level `ContractCall`
   *
   * This is useful for dynamic contract wrapping when ABI is not known at compile time.
   *
   * @param abi - ABI definition for the contract (Interface or raw ABI).
   * @param address - Deployed contract address (optional).
   * @param driver - Ethers provider or signer (optional).
   * @param options - Additional contract options (timeouts, mutability, etc.).
   * @returns A dynamically generated class that extends the base `BaseContract` class with ABI methods.
   */
  static createAutoClass(
    abi: Interface | InterfaceAbi,
    address?: string,
    driver?: Provider | Signer,
    options?: ContractOptions,
  ): DynamicContractConstructor;
  /**
   * Creates an instance of a dynamically generated contract class, with all ABI methods
   * and `get<MethodName>Call()` accessors added automatically at runtime.
   *
   * This is a convenience method equivalent to:
   * ```ts
   * const DynamicClass = BaseContract.createAutoClass(...);
   * const instance = new DynamicClass();
   * ```
   *
   * Useful for runtime-generated contract instances with full dynamic access to ABI-defined methods.
   *
   * @param abi - ABI definition for the contract (Interface or raw ABI).
   * @param address - Deployed contract address (optional).
   * @param driver - Ethers provider or signer (optional).
   * @param options - Additional contract options (timeouts, mutability, etc.).
   * @returns A ready-to-use contract instance with ABI methods and call generators.
   */
  static createAutoInstance(
    abi: Interface | InterfaceAbi,
    address?: string,
    driver?: Provider | Signer,
    options?: ContractOptions,
  ): DynamicContract;

  public readonly address: string;
  public readonly isCallable: boolean;
  public readonly isReadonly: boolean;
  public readonly contract: EthersContract;
  protected readonly driver?: Provider | Signer;
  protected readonly contractOptions: ContractOptions;

  constructor(
    abi: Interface | InterfaceAbi,
    address?: string,
    driver?: Signer | Provider,
    options?: ContractOptions,
  );

  /**
   * Current provider, if available.
   */
  get provider(): Provider | undefined;
  /**
   * Current signer, if available.
   */
  get signer(): Signer | undefined;
  /**
   * BaseContract interface (ABI parser).
   */
  get interface(): Interface;

  /**
   * Executes a contract method call or transaction depending on its mutability.
   * Automatically handles static calls vs. mutations and supports signal-based timeouts/aborts.
   */
  call<T = unknown>(
    method: string,
    args?: any[],
    options?: ContractCallOptions,
  ): Promise<T>;
  /**
   * Creates a low-level call object for a given method, for use with multicall or batching.
   */
  getCall(
    methodName: string,
    args?: any[],
    callData?: Partial<ContractCall>,
  ): ContractCall;

  /**
   * Subscribes to an on-chain event using a WebSocket provider.
   */
  listenEvent(eventName: string, listener: Listener): Promise<BaseContract>;
  /**
   * Fetches and decodes logs for given events between specified blocks
   * (or N blocks ago - as first arg);
   */
  getLogs(
    fromBlock: number,
    eventsNames?: string[],
    toBlock?: number,
    options?: ContractGetLogsOptions,
  ): Promise<LogDescription[]>;
  /**
   * Asynchronous generator that yields logs one-by-one in batches.
   * Allows for streaming consumption and signal-based cancellation.
   */
  getLogsStream(
    fromBlock: number,
    eventsNames?: string[],
    toBlock?: number,
    options?: ContractGetLogsOptions,
  ): AsyncGenerator<LogDescription, void, unknown>;

  getTimeoutSignal(isStatic: boolean, timeoutMs?: number): Promise<AbortSignal>;
}
