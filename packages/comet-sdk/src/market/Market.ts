import type { Curve } from "../curve";
import type { Base, Collateral } from "../token";
import type { Token } from "../token/Token";
import type { IMarket } from "./IMarket";
import type { IMarketProposalTx } from "./IMarketProposalTx";
import { MarketMethods } from "./MarketMethods";

export class Market implements IMarket {
  public cometAddress: string;
  public utilization: bigint;
  public supplyRate: bigint;
  public borrowRate: bigint;
  //
  public totalBorrow: bigint;
  public totalSupply: bigint;
  public totalReserves: bigint;
  public baseToken: Base;
  public collaterals: Collateral[];
  public availableLiquidity: bigint;
  //
  public configControllerAddress: string;
  public owner: string;
  public guardian: string;
  public curator: string;
  public feeDistribution: number;
  //
  public curvePreset: Curve;
  //
  public proposals: IMarketProposalTx[];
  //
  public comp: Token;

  constructor(marketData: IMarket) {
    this.cometAddress = marketData.cometAddress;
    this.utilization = marketData.utilization;
    this.supplyRate = marketData.supplyRate;
    this.borrowRate = marketData.borrowRate;
    //
    this.totalBorrow = marketData.totalBorrow;
    this.totalSupply = marketData.totalSupply;
    this.totalReserves = marketData.totalReserves;
    this.baseToken = marketData.baseToken;
    this.collaterals = marketData.collaterals;
    this.availableLiquidity = marketData.availableLiquidity;
    //
    this.configControllerAddress = marketData.configControllerAddress;
    this.owner = marketData.owner;
    this.guardian = marketData.guardian;
    this.curator = marketData.curator;
    this.feeDistribution = marketData.feeDistribution;
    //
    this.curvePreset = marketData.curvePreset;
    //
    this.proposals = marketData.proposals;
    //
    this.comp = marketData.comp;
  }

  get borrowApr(): number {
    return MarketMethods.calcApr(this.borrowRate);
  }
  get supplyApr(): number {
    return MarketMethods.calcApr(this.supplyRate);
  }

  get marketPrice(): number {
    return this.baseToken.price; // or specific for eth
  }

  get totalEarning(): bigint {
    return MarketMethods.totalEarning(
      this.baseToken.symbol,
      this.baseToken.price,
      this.totalSupply,
    );
  }
  get totalBorrowed(): bigint {
    return MarketMethods.totalBorrowed(
      this.baseToken.symbol,
      this.baseToken.price,
      this.totalBorrow,
    );
  }

  get netEarnApr(): number {
    const compToSuppliersPerDay = MarketMethods.compToSuppliersPerDay(
      this.baseToken.baseTrackingSupplySpeed,
      this.baseToken.baseIndexScale,
    );
    const supplyCompRewardApr = MarketMethods.supplyCompRewardApr(
      this.comp.price, // in usd
      this.comp.decimals,
      compToSuppliersPerDay,
      this.totalSupply,
      this.baseToken.price,
      this.baseToken.decimals,
    );

    return MarketMethods.netEarnApr(this.supplyApr, supplyCompRewardApr);
  }
  get netBorrowApr(): number {
    const compToBorrowersPerDay = MarketMethods.compToBorrowersPerDay(
      this.baseToken.baseTrackingBorrowSpeed,
      this.baseToken.baseIndexScale,
    );
    const borrowCompRewardApr = MarketMethods.borrowCompRewardApr(
      this.comp.price,
      this.comp.decimals,
      compToBorrowersPerDay,
      this.totalBorrowed,
      this.baseToken.price,
      this.baseToken.decimals,
    );

    return MarketMethods.netBorrowApr(this.borrowApr, borrowCompRewardApr);
  }
}
