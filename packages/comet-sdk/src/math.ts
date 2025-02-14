import { PERCENT_PRECISION } from "./constants";

export function divideWithPrecision(value: bigint, divisor: bigint, decimals: number): string {
    const factor = BigInt(10 ** decimals);
    const result = value * factor / divisor;
    const wholePart = result / divisor;
    const fractionalPart = result % factor;

    return `${wholePart}.${fractionalPart.toString().padStart(decimals, '0')}`;
}

export function coefficientToPercents(value: string | number, precision = PERCENT_PRECISION): string {
    return (Number(value) * 100).toFixed(precision);
}
