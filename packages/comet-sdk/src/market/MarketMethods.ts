import { COMET_FACTOR, SECONDS_PER_YEAR } from "../constants";
import { divideWithPrecision } from "../math";

/**
 * Namespace of utility functions to ease market-related calculations.
 */
export namespace MarketHelpers {
    export function getAprCoefficient(rate: bigint): number {
        // Returns 0.xx format value
        // Borrow APR = Borrow Rate / (10 ^ 18) * Seconds Per Year * 100
        // https://docs.compound.finance/interest-rates/
        const apr = rate * BigInt(SECONDS_PER_YEAR);
        return Number(divideWithPrecision(apr, BigInt(COMET_FACTOR), 1e18))
    }
}