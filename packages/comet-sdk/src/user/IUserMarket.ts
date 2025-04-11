import {IMarket} from "../market";

export interface IUserMarket extends IMarket {
    borrowBalance: bigint;
    supplyBalance: bigint;
    baseTokenBalance: bigint;
}
