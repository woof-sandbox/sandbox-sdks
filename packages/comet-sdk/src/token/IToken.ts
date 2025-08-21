export interface IToken {
  tokenAddress: string;
  symbol: string;
  priceFeedDecimals: bigint;
  price: string;
  priceFeedAddress: string; // ?: price service or entity
}
