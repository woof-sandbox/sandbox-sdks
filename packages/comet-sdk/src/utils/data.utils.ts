import { formatUnits, parseUnits } from "viem";

export abstract class DataUtils {
  static parseTokenInput(input: string): string {
    return input.replace(/,/g, "").trim();
  }

  static validateNumericInput(input: string): boolean {
    return /^-?\d*\.?\d+$/.test(input);
  }

  static toBigNumber(value: string, decimals: number): bigint {
    return parseUnits(value, decimals);
  }

  static fromBigNumber(value: bigint, decimals: number): string {
    return formatUnits(value, decimals);
  }
}
