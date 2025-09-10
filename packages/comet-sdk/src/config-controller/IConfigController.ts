import type { Address } from "viem";

export interface IConfigController {
  address: Address;
  owner: Address;
  guardian: Address;
  curator: Address;
  curatorFee: number;
}
