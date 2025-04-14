import { ethers } from "ethers";

export class FormattingUtils {
  static formatTokenValue(value: bigint, decimals: number): string {
    return ethers.formatUnits(value, decimals);
  }

  static formatNumber(value: number | string, decimals = 2): string {
    const num = typeof value === "string" ? Number.parseFloat(value) : value;
    return num.toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  }

  static formatCurrency(value: number, symbol = "$"): string {
    return `${symbol}${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  static sliceAddress(address: string): string {
    return address.length === 42
      ? `${address.slice(0, 6)}...${address.slice(-4)}`
      : address;
  }

  static formatPercentage(value: number, decimals = 2): string {
    return `${(value * 100).toFixed(decimals)}%`;
  }
}
