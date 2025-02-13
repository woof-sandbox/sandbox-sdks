export function divideWithPrecision(value: bigint, divisor: bigint, decimals: number): string {
    const factor = BigInt(10 ** decimals);
    const result = value * factor / divisor;
    const wholePart = result / divisor;
    const fractionalPart = result % factor;

    return `${wholePart}.${fractionalPart.toString().padStart(decimals, '0')}`;
}
