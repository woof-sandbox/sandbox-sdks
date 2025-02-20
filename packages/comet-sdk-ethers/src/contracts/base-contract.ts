import {
  Contract,
  type ContractMethod,
  type Interface,
  type InterfaceAbi,
  JsonRpcProvider,
  type Wallet,
} from "ethers";
import { MULTICALL_ALLOW_FAILURE } from "../constants";
import { CONTRACTS_ERRORS } from "../errors/contracts";
import type { ContractCall, StateMutability } from "./entities";
import { isStaticMethod } from "./helpers";

export class BaseContract {
  protected readonly contract: Contract;
  public readonly isCallable: boolean;
  public readonly isReadonly: boolean;

  constructor(
    abi: Interface | InterfaceAbi,
    readonly address: string = "0x0000000000000000000000000000000000000000",
    protected readonly driver?: JsonRpcProvider | Wallet,
  ) {
    this.isCallable = !!address && !!driver;
    this.isReadonly = !this.isCallable || driver instanceof JsonRpcProvider;

    this.contract = new Contract(address, abi, driver);
  }

  get interface(): Interface {
    return this.contract.interface;
  }

  async call<T = unknown>(methodName: string, args: any[] = []): Promise<T> {
    if (!this.isCallable) throw CONTRACTS_ERRORS.TRY_TO_CALL_NON_CALLABLE;
    const method = this.contract[methodName] as ContractMethod;

    if (!method) throw CONTRACTS_ERRORS.METHOD_NOT_FOUND(methodName);

    const functionFragment = this.contract.interface.getFunction(methodName);
    if (!functionFragment)
      throw CONTRACTS_ERRORS.FRAGMENT_NOT_FOUND(methodName);

    if (isStaticMethod(functionFragment.stateMutability)) {
      return await method.staticCall(...args);
    } else {
      if (this.isReadonly) throw CONTRACTS_ERRORS.TRY_TO_CALL_NON_CALLABLE;
      return await method(...args);
    }
  }

  getCall(methodName: string, args: any[] = []): ContractCall {
    if (!this.address) throw CONTRACTS_ERRORS.ADDRESS_IS_NOT_PROVIDED;

    const functionFragment = this.contract.interface.getFunction(methodName);
    if (!functionFragment)
      throw CONTRACTS_ERRORS.FRAGMENT_NOT_FOUND(methodName);

    return {
      method: methodName,
      target: this.address,
      allowFailure: MULTICALL_ALLOW_FAILURE,
      callData: this.interface.encodeFunctionData(methodName, args),
      stateMutability: functionFragment.stateMutability as StateMutability,
    };
  }
}
