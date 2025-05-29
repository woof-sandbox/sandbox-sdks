import type { Collateral, IBase, IToken } from "../token";
import type { IMarket } from "./IMarket";
import type { IMarketInterestRateModel } from "./IMarketInterestRateModel";
import type { IMarketProposalTx } from "./IMarketProposalTx";
import { MarketMethods } from "./MarketMethods";

export class Market implements IMarket {
  public cometAddress: string;
  public utilization: bigint;
  public supplyRate: bigint;
  public borrowRate: bigint;
  //
  public borrowMinAmount: bigint;
  public totalBorrow: bigint;
  public totalSupply: bigint;
  public totalReserves: bigint;
  public baseToken: IBase;
  public collaterals: Collateral[];
  public availableLiquidity: bigint;
  //
  public configControllerAddress: string;
  public ownerAddress: string;
  public guardianAddress: string;
  public curatorAddress: string;
  public curatorFee: number;
  //
  public proposals: IMarketProposalTx[];
  //  added reward tokens (always several tokens (from DAO one (decide itself with inner mechanics) & owner of Config Controller decision))
  public compToken: IToken;
  public rewardTokens: IToken[];

  constructor(marketData: IMarket) {
    this.cometAddress = marketData.cometAddress;
    this.utilization = marketData.utilization;
    this.supplyRate = marketData.supplyRate;
    this.borrowRate = marketData.borrowRate;
    //
    this.borrowMinAmount = marketData.borrowMinAmount;
    this.totalBorrow = marketData.totalBorrow;
    this.totalSupply = marketData.totalSupply;
    this.totalReserves = marketData.totalReserves;
    this.baseToken = marketData.baseToken;
    this.collaterals = marketData.collaterals;
    this.availableLiquidity = marketData.availableLiquidity;
    //
    this.configControllerAddress = marketData.configControllerAddress;
    this.ownerAddress = marketData.ownerAddress;
    this.guardianAddress = marketData.guardianAddress;
    this.curatorAddress = marketData.curatorAddress;
    this.curatorFee = marketData.curatorFee;
    //
    this.proposals = marketData.proposals;
    //
    this.compToken = marketData.compToken;
    this.rewardTokens = marketData.rewardTokens;
  }

  get interestRateChartData(): IMarketInterestRateModel[] {
    return MarketMethods.getInterestRateChartData(
      this.utilizationPercent,
      this.baseToken.curvePresets[0]!,
    );
  }

  get totalSupplyUSD(): number {
    return MarketMethods.getTotalSupplyUSD(this.totalSupply, this.baseToken);
  }

  get totalBorrowUSD(): number {
    return MarketMethods.totalBorrowUSD(this.totalBorrow, this.baseToken);
  }

  get totalReservesUSD(): number {
    return MarketMethods.getTotalReservesUSD(
      this.totalReserves,
      this.baseToken,
    );
  }

  get utilizationPercent(): number {
    return MarketMethods.getUtilization(this.utilization);
  }

  get collateralization(): number {
    return MarketMethods.getCollateralization(
      this.totalBorrow,
      this.totalSupply,
      this.baseToken,
    );
  }

  get totalValueLocked(): number {
    return MarketMethods.getTVL(
      this.availableLiquidity,
      this.baseToken,
      this.collaterals,
    );
  }

  get borrowApr(): number {
    return MarketMethods.calcApr(this.borrowRate);
  }

  get supplyApr(): number {
    return MarketMethods.calcApr(this.supplyRate);
  }

  get price(): string {
    return this.baseToken.price;
  }

  get totalEarned(): bigint {
    return MarketMethods.totalEarned(this.baseToken.price, this.totalSupply);
  }

  get totalBorrowed(): bigint {
    return MarketMethods.totalBorrowed(this.baseToken.price, this.totalBorrow);
  }

  get netEarnAprs(): number[] {
    return MarketMethods.netEarnAprs(
      this.baseToken,
      this.totalEarned,
      this.compToken,
      this.rewardTokens,
      this.supplyApr,
    );
  }

  get netBorrowAprs(): number[] {
    return MarketMethods.netBorrowAprs(
      this.baseToken,
      this.totalBorrowed,
      this.compToken,
      this.rewardTokens,
      this.borrowApr,
    );
  }

  get totalCollateralsSupplyUSD(): number {
    return MarketMethods.getTotalCollateralsSupply(this.collaterals);
  }

  marketsToMigrate(marketsList: Market[]) {
    return MarketMethods.getMarketsToMigrate(
      marketsList,
      this.baseToken,
      this.collaterals,
    );
  }
}
