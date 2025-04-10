import type { Interface, InterfaceAbi, Provider, Signer } from "ethers";
import type { ContractOptions } from "./contract-options";

export interface DynamicContractConstructorArgs {
  abi?: Interface | InterfaceAbi;
  address?: string;
  driver?: Provider | Signer;
  options?: ContractOptions;
}
