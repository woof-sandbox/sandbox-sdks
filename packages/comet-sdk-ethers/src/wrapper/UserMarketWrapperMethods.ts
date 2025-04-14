import type {ICollateral} from "@sandbox/comet-sdk";
import {formatUnits} from "ethers";
import {Address, parseUnits} from "viem";
import {PRICE_FEED_FACTOR_UNITS} from "../constants";
import {MultiAllowanceCallType} from "../contracts/entities/multi-allowance-call";
import {MultiAllowanceResponseType} from "../contracts/entities/multi-allowance-result";
import {DataUtils} from "../utils";

export namespace UserMarketWrapperMethods {
    function getTokenPrice(
        symbol: string,
        tokenPrice: bigint,
        marketPrice: number,
    ): number {
        return symbol === "ETH" ||
        symbol === "wstETH" ||
        symbol === "WBTC" ||
        symbol === "WETH"
            ? Number(formatUnits(tokenPrice, PRICE_FEED_FACTOR_UNITS)) * marketPrice
            : Number(formatUnits(tokenPrice, PRICE_FEED_FACTOR_UNITS));
    }

    export function getBorrowCapacityMarketUSD(collaterals: ICollateral[], marketPrice: string) {
        return collaterals
            .map(
                (collateral) =>
                    //TODO add totalSupply
                    // Number(formatUnits(collateral.totalSupply, collateral.decimals)) *
                    Number(formatUnits(collateral.liquidationFactor, 18)) *
                    getTokenPrice(
                        collateral.symbol,
                        parseUnits(collateral.price, PRICE_FEED_FACTOR_UNITS),
                        Number(marketPrice),
                    )
            )
            .reduce((a: number, b: number) => a + b, 0);
    }

    export function maxWithDrawCollateralAmount(
        supplyBalance: bigint,
        borrowBalance: bigint,
        allCollaterals: ICollateral[],
        marketPrice: string,
        marketDecimals: bigint) {


        const borrowCapacityUSD = getBorrowCapacityMarketUSD(allCollaterals, marketPrice)

        const supplyAmount = DataUtils.fromBigNumber(
            supplyBalance,
            Number(marketDecimals)
        )

        const borrowBalanceUSD = Number(DataUtils.fromBigNumber(
            borrowBalance,
            Number(marketDecimals)
        )) * Number(marketPrice)


        const availableToBorrow = (borrowCapacityUSD - borrowBalanceUSD);

        if (borrowBalance > BigInt(0)) {

            return (availableToBorrow / Number(marketPrice)).toString();
        } else {
            return supplyAmount;
        }
    }

    export function findMarketCollateralByAddress(marketCollaterals: ICollateral[], collateralAddress: Address) {
        return marketCollaterals.find((marketCollateral) => marketCollateral.tokenAddress.toLowerCase() === collateralAddress.toLowerCase())
    }

    export function isSomeTokenSmallAllowance(collateralsAllowances: MultiAllowanceResponseType[], marketCollaterals: ICollateral[],) {
        return collateralsAllowances.some((collateral) => {
            const currentCollateralData = findMarketCollateralByAddress(marketCollaterals, collateral.tokenAddress)

            return UserMarketWrapperMethods.isTokenSmallAllowance(parseUnits(collateral.inputAmount, Number(currentCollateralData?.decimals || 18)), collateral.allowance)
        })
    }

    export function isTokenSmallAllowance(tokenAmount: bigint, allowance?: bigint) {
        if (!allowance) {
            return true
        }
        return tokenAmount < allowance
    }

    export function isAllCollateralsFromMarket(marketCollaterals: ICollateral[], supplyCollaterals: MultiAllowanceCallType[]) {
        return supplyCollaterals.map(({tokenAddress}) => tokenAddress)
            .every((tokenAddress) => marketCollaterals.map((marketCollateral) => marketCollateral.tokenAddress.toLowerCase()).includes(tokenAddress))
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
                            parseUnits(collateral.price, PRICE_FEED_FACTOR_UNITS),
                            Number(marketPrice),
                        ),
                )
                .reduce((a: number, b: number) => a + b) / 1.5;

        const borrow = Number(borrowBalance) * Number(marketPrice);

        const availableToBorrow = (borrowCapacity - borrow) / Number(marketPrice);

        return availableToBorrow.toString();
    }
}
