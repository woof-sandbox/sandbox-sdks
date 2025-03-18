import type { IUserTransaction } from "./IUserTransaction";

export interface IUser {
  address: string;
  borrowMarkets: string[];
  landMarkets: string[];
  txs: IUserTransaction[];
}
