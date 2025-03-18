import { formatUnits, parseUnits } from "ethers";
import { ETH_SYMBOLS, PRICE_FEED_MANTISSA } from "../constants";
import type { Curve } from "../curve";
import type { Base, Collateral } from "../token";
import type { IMarket } from "./IMarket";
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
  public curator: string;
  public feeDistribution: number;
  //
  public curvePreset: Curve;

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
    this.curator = marketData.curator;
    this.feeDistribution = marketData.feeDistribution;
    //
    this.curvePreset = marketData.curvePreset;
  }

  get borrowApr(): string {
    return MarketMethods.getAprPercents(this.borrowRate);
  }
  get supplyApr(): string {
    return MarketMethods.getAprPercents(this.supplyRate);
  }

  get marketPrice(): number {
    return this.baseToken.price; // ?
  }

  get totalEarning(): bigint {
    // If the base asset is ETH or wstETH, its value is converted to USD based on the current price (baseToken.price).
    // For other assets, the value remains unchanged.
    if (ETH_SYMBOLS.includes(this.baseToken.symbol)) {
      return BigInt(
        formatUnits(
          this.totalSupply *
            parseUnits(
              this.baseToken.price.toFixed(PRICE_FEED_MANTISSA),
              PRICE_FEED_MANTISSA,
            ),
          PRICE_FEED_MANTISSA,
        ),
      );
    }
    return this.totalSupply;
  }
  get totalBorrowed(): bigint {
    // If the base asset is ETH or wstETH, its value is converted to USD based on the current price (baseToken.price).
    // For other assets, the value remains unchanged.
    if (ETH_SYMBOLS.includes(this.baseToken.symbol)) {
      return BigInt(
        formatUnits(
          this.totalBorrow *
            parseUnits(
              this.baseToken.price.toFixed(PRICE_FEED_MANTISSA),
              PRICE_FEED_MANTISSA,
            ),
          PRICE_FEED_MANTISSA,
        ),
      );
    }
    return this.totalBorrow;
  }

  get netEarnApr(): string {
    // todo
    return "";
  }
  get netBorrowApr(): string {
    // todo
    return "";
  }
}
