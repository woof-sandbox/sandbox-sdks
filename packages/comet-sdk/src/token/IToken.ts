export interface IToken {
  tokenAddress: string;
  symbol: string;
  decimals: bigint;
  price: string;
  priceFeedAddress: string; // ?: price service or entity
}
