import type { IUser } from "./IUser";

export class User implements IUser {
  public address: string;
  public borrowMarkets: string[];
  public landMarkets: string[];

  constructor(userData: IUser) {
    this.address = userData.address;
    this.borrowMarkets = userData.borrowMarkets;
    this.landMarkets = userData.landMarkets;
  }
}
