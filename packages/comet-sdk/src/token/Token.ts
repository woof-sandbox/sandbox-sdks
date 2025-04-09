import type { IToken } from "./IToken";

export class Token implements IToken {
  public tokenAddress: string;
  public symbol: string;
  public decimals: bigint; // number
  public price: string; // number
  public priceFeedAddress: string;

  constructor(tokenData: IToken) {
    this.tokenAddress = tokenData.tokenAddress;
    this.symbol = tokenData.symbol;
    this.decimals = tokenData.decimals;
    this.price = tokenData.price;
    this.priceFeedAddress = tokenData.priceFeedAddress;
  }
}
