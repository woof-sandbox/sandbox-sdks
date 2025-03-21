import { PERCENT_PRECISION } from "./constants";

export function coefficientToPercents(
  value: string | number,
  precision = PERCENT_PRECISION,
): string {
  return (Number(value) * 100).toFixed(precision);
}
