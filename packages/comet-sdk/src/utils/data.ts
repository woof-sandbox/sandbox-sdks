import { ethers } from "ethers";

export class DataUtils {
  static parseTokenInput(input: string): string {
    return input.replace(/,/g, "").trim();
  }

  static validateNumericInput(input: string): boolean {
    return /^-?\d*\.?\d+$/.test(input);
  }

  static toBigNumber(value: string, decimals: number): bigint {
    return ethers.parseUnits(value, decimals);
  }

  static fromBigNumber(value: bigint, decimals: number): string {
    return ethers.formatUnits(value, decimals);
  }
}
