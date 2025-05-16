import type { Address } from "viem";
import type { ActionType } from "./action-type";

export type ActionData = {
  address: Address;
  value: string;
  action: ActionType;
};
