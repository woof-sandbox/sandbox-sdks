import {Market} from "../market";
import {IUserMarket} from "./IUserMarket";

export class UserMarket extends Market implements IUserMarket {
    public borrowBalance: bigint;
    public supplyBalance: bigint;
    public baseTokenBalance: bigint;

    constructor(userMarket: IUserMarket) {
        super(userMarket);
        this.borrowBalance = userMarket.borrowBalance;
        this.supplyBalance = userMarket.supplyBalance;
        this.baseTokenBalance = userMarket.baseTokenBalance;
    }

}
