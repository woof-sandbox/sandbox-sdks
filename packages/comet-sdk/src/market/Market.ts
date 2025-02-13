import { IMarket } from "./IMarket";
import { MarketHelpers } from "./MarketMethods";

export class Market implements IMarket {
    cometAddress: string;
    utilization?: bigint;
    supplyRate: bigint;
    borrowRate: bigint;

    constructor({cometAddress, utilization, supplyRate, borrowRate}: IMarket) {
        this.cometAddress = cometAddress;
        this.utilization = utilization;
        this.supplyRate = supplyRate;
        this.borrowRate = borrowRate;
    }

    get borrowApr() {
        return MarketHelpers.getAprCoefficient(this.borrowRate);
    }

    get supplyApr() {
        return MarketHelpers.getAprCoefficient(this.supplyRate);
    }
}