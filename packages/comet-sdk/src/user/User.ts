import { IUser } from "./IUser";

export class User implements IUser {
    public address: string;
    public borrowMarkets?: string[];
    public landMarkets?: string[];

    constructor({address, borrowMarkets, landMarkets}: IUser) {
        this.address = address;
        this.borrowMarkets = borrowMarkets;
        this.landMarkets = landMarkets;
    }
}