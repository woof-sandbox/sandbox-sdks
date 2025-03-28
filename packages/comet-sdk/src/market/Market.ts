import type { IBase, ICollateral, IToken } from "../token";
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
  public baseToken: IBase;
  public collaterals: ICollateral[];
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

  get borrowApr(): number {
    return MarketMethods.calcApr(this.borrowRate);
  }
  get supplyApr(): number {
    return MarketMethods.calcApr(this.supplyRate);
  }

  get price(): number {
    return this.baseToken.price;
  }

  get totalEarned(): bigint {
    return MarketMethods.totalEarned(this.baseToken.price, this.totalSupply);
  }
  get totalBorrowed(): bigint {
    return MarketMethods.totalBorrowed(this.baseToken.price, this.totalBorrow);
  }

  get netEarnAprs(): number[] {
    return MarketMethods.netBorrowAprs(
        this.baseToken,
        this.totalEarned,
        this.compToken,
        this.rewardTokens,
        this.borrowApr,
    )
  }
  get netBorrowAprs(): number[] {
    return MarketMethods.netBorrowAprs(
        this.baseToken,
        this.totalBorrowed,
        this.compToken,
        this.rewardTokens,
        this.borrowApr,
    )
  }
}
