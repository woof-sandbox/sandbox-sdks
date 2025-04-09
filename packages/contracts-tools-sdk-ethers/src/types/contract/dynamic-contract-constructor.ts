import type { DynamicContract } from "./dynamic-contract";
import type { DynamicContractConstructorArgs } from "./dynamic-contract-constructor-args";

export type DynamicContractConstructor = new (
  args?: DynamicContractConstructorArgs,
) => DynamicContract;
