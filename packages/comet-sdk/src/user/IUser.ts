import type { IUserTransaction } from "../market/IMarketProposalTx";

export interface IUser {
  address: string;
  borrowMarkets: string[];
  landMarkets: string[];
  txs: IUserTransaction[];
}
