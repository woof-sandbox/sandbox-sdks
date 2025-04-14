import type { IUser } from "./IUser";

export class User implements IUser {
  public address: string;
  public borrowMarkets: string[];
  public lendMarkets: string[];

  constructor(userData: IUser) {
    this.address = userData.address;
    this.borrowMarkets = userData.borrowMarkets;
    this.lendMarkets = userData.lendMarkets;
  }
}
