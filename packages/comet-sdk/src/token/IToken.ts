export interface IToken {
  tokenAddress: string;
  symbol: string;
  decimals: bigint;
  priceFeedDecimals: bigint;
  price: string;
  priceFeedAddress: string; // ?: price service or entity
}
