import type { IToken } from "./IToken";

export class Token implements IToken {
  public tokenAddress: string;
  public symbol: string;
  public decimals: bigint;
  public priceFeedDecimals: bigint; // number
  public price: string; // number
  public priceFeedAddress: string;

  constructor(tokenData: IToken) {
    this.tokenAddress = tokenData.tokenAddress;
    this.symbol = tokenData.symbol;
    this.decimals = tokenData.decimals;
    this.priceFeedDecimals = tokenData.priceFeedDecimals;
    this.price = tokenData.price;
    this.priceFeedAddress = tokenData.priceFeedAddress;
  }
}
