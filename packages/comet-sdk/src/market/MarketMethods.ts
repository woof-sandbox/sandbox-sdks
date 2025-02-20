import { formatUnits } from "ethers";
import { COMET_FACTOR_DECIMALS, SECONDS_PER_YEAR } from "../constants";
import { coefficientToPercents } from "../math";

/**
 * Namespace of utility functions to ease market-related calculations.
 */
export namespace MarketMethods {
  export function getAprCoefficient(rate = 0n): string {
    // Returns 0.xx format value
    // Borrow APR(%)= Borrow Rate / (10 ^ 18) * Seconds Per Year * 100
    // https://docs.compound.finance/interest-rates/
    if (!rate) return "0.0";
    const apr = rate * BigInt(SECONDS_PER_YEAR);
    return formatUnits(apr, COMET_FACTOR_DECIMALS);
  }
  export function getAprPercents(rate?: bigint): string {
    // Returns 90.00000% format value
    // Borrow APR(%)= Borrow Rate / (10 ^ 18) * Seconds Per Year * 100
    // https://docs.compound.finance/interest-rates/
    return coefficientToPercents(getAprCoefficient(rate));
  }
}
