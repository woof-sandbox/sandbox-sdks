import type { IUser } from "./IUser";
import type { IUserTransaction } from "./IUserTransaction";

export class User implements IUser {
  public address: string;
  public borrowMarkets: string[];
  public landMarkets: string[];
  public txs: IUserTransaction[];

  constructor(userData: IUser) {
    this.address = userData.address;
    this.borrowMarkets = userData.borrowMarkets;
    this.landMarkets = userData.landMarkets;
  }
}
