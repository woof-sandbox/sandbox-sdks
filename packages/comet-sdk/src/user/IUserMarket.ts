import {IMarket} from "../market";

export interface IUserMarket extends IMarket {
    borrowBalance: string;
    supplyBalance: string;
    baseTokenBalance: string;
}
