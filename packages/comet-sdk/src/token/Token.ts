import type { IToken } from "./IToken";

export class Token implements IToken {
  public tokenAddress: string;
  public symbol: string;
  public price: number;
  public priceFeedAddress: string;

  constructor(tokenData: IToken) {
    this.tokenAddress = tokenData.tokenAddress;
    this.symbol = tokenData.symbol;
    this.price = tokenData.price;
    this.priceFeedAddress = tokenData.priceFeedAddress;
  }
}
