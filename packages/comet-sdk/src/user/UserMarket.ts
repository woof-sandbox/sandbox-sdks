import {Market} from "../market";
import {IUserMarket} from "./IUserMarket";

export class UserMarket extends Market implements IUserMarket {
    public borrowBalance: string;
    public supplyBalance: string;
    public baseTokenBalance: string;

    constructor(userMarket: IUserMarket) {
        super(userMarket);
        this.borrowBalance = userMarket.borrowBalance;
        this.supplyBalance = userMarket.supplyBalance;
        this.baseTokenBalance = userMarket.baseTokenBalance;
    }

}
