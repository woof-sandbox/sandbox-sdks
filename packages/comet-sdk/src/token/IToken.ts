export interface IToken {
    tokenAddress: string;
    symbol: string;
    decimals: bigint;
    price: bigint;
    priceFeedAddress: string; // ?: price service or entity
}
