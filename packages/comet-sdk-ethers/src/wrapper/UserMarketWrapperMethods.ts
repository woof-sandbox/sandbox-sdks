import {formatUnits} from "ethers";
import {PRICE_FEED_FACTOR_UNITS} from "../constants";
import {ICollateral} from "@sandbox/comet-sdk";
import {parseUnits} from "viem";

export namespace UserMarketWrapperMethods {
    function getTokenPrice(symbol: string, tokenPrice: bigint, marketPrice: number): number {
        return symbol === 'ETH' || symbol === 'wstETH' || symbol === 'WBTC' || symbol === 'WETH'
            ? Number(formatUnits(tokenPrice, PRICE_FEED_FACTOR_UNITS)) * marketPrice
            : Number(formatUnits(tokenPrice, PRICE_FEED_FACTOR_UNITS));
    }

    export function availableToBorrow(borrowBalance: bigint, marketPrice: string, collaterals: ICollateral[]) {
        const borrowCapacity =
            collaterals
                .map(
                    (collateral) =>
                        // Number(formatUnits(collateral.totalSupply, collateral.decimals)) * // here need to add user total supply in collateral
                        Number(formatUnits(collateral.collateralFactor, 18)) *
                        getTokenPrice(collateral.symbol, parseUnits(collateral.price, PRICE_FEED_FACTOR_UNITS), Number(marketPrice))
                )
                .reduce((a: number, b: number) => a + b) / 1.5;

        const borrow = Number(borrowBalance) * Number(marketPrice);

        const availableToBorrow = (borrowCapacity - borrow) / Number(marketPrice);

        return availableToBorrow.toString();

    };
}

