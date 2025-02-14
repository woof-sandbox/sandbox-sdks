import { IMarket } from "./IMarket";
import { MarketMethods } from "./MarketMethods";

const missFieldErr = (fieldName: string) => new Error(`Missing field ${fieldName}`);

export class Market implements IMarket {
    public cometAddress: string;
    public utilization?: bigint;
    public supplyRate?: bigint;
    public borrowRate?: bigint;

    constructor({cometAddress, utilization, supplyRate, borrowRate}: IMarket) {
        this.cometAddress = cometAddress;
        this.utilization = utilization;
        this.supplyRate = supplyRate;
        this.borrowRate = borrowRate;
    }

    get borrowApr(): string {
        if (!this.borrowRate) throw missFieldErr('borrowRate');
        return MarketMethods.getAprPercents(this.borrowRate);
    }

    get supplyApr(): string {
        if (!this.supplyRate) throw missFieldErr('supplyRate');
        return MarketMethods.getAprPercents(this.supplyRate);
    }
}