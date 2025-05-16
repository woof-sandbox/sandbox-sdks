import { Address } from "viem";

export type ActionsType =
  | "supply"
  | "withdraw"
  | "lend"
  | "borrow"
  | "withdraw-base"
  | "repay";

export type ActionsData = {
  address: Address;
  value: string;
  action: ActionsType;
};
