export class FormattingUtils {
  static formatTokenValue(value: bigint, decimals: number): string {
    return (Number(value) / 10 ** decimals).toFixed(decimals);
  }

  static formatNumber(value: number | string, decimals: number = 2): string {
    const num = typeof value === "string" ? parseFloat(value) : value;
    return num.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  }

  static formatCurrency(value: number, symbol: string = "$"): string {
    return `${symbol}${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  static sliceAddress(address: string): string {
    return address.length === 42 ? `${address.slice(0, 6)}...${address.slice(-4)}` : address;
  }

  static formatPercentage(value: number, decimals: number = 2): string {
    return `${(value * 100).toFixed(decimals)}%`;
  }
}
