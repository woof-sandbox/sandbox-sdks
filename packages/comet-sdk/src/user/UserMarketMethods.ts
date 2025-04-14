import type {ICollateral} from "@sandbox/comet-sdk";
import {formatUnits} from "ethers";
import {parseUnits} from "viem";
import { PRICE_FEED_MANTISSA} from "../constants";

export namespace UserMarketMethods {
    function getTokenPrice(
        symbol: string,
        tokenPrice: bigint,
        marketPrice: number,
    ): number {
        return symbol === "ETH" ||
        symbol === "wstETH" ||
        symbol === "WBTC" ||
        symbol === "WETH"
            ? Number(formatUnits(tokenPrice, PRICE_FEED_MANTISSA)) * marketPrice
            : Number(formatUnits(tokenPrice, PRICE_FEED_MANTISSA));
    }

    export function availableToBorrow(
        borrowBalance: bigint,
        marketPrice: string,
        collaterals: ICollateral[],
    ) {
        const borrowCapacity =
            collaterals
                .map(
                    (collateral) =>
                        // Number(formatUnits(collateral.totalSupply, collateral.decimals)) * // here need to add user total supply in collateral
                        Number(formatUnits(collateral.collateralFactor, 18)) *
                        getTokenPrice(
                            collateral.symbol,
                            parseUnits(collateral.price, PRICE_FEED_MANTISSA),
                            Number(marketPrice),
                        ),
                )
                .reduce((a: number, b: number) => a + b) / 1.5;

        const borrow = Number(borrowBalance) * Number(marketPrice);

        const availableToBorrow = (borrowCapacity - borrow) / Number(marketPrice);

        return availableToBorrow.toString();
    }
}
